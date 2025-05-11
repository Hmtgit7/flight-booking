// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types/user';
import { authService } from '../services/auth-service';
import { walletService } from '../services/wallet-service';
import { getToken, removeToken } from '../utils/storage';
import { Wallet } from '../types/wallet';

interface AuthContextType {
    user: User | null;
    wallet: Wallet | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isRefreshingWallet: boolean;
    walletError: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshWallet: () => Promise<boolean>;
    fetchDefaultWallet: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshingWallet, setIsRefreshingWallet] = useState<boolean>(false);
    const [walletError, setWalletError] = useState<string | null>(null);
    const [walletRetries, setWalletRetries] = useState<number>(0);

    // Function to fetch user wallet with retry mechanism
    const fetchWallet = useCallback(async (retryCount = 0): Promise<boolean> => {
        if (retryCount > 3) {
            console.error('Maximum wallet fetch retries reached');
            return false;
        }

        setIsRefreshingWallet(true);
        setWalletError(null);

        try {
            console.log(`Attempting to fetch wallet (attempt ${retryCount + 1})`);
            const walletData = await walletService.getUserWallet();

            // Validate wallet data
            if (!walletData || typeof walletData.balance !== 'number') {
                throw new Error('Invalid wallet data received');
            }

            console.log('Wallet fetched successfully:', walletData);
            setWallet(walletData);
            setWalletRetries(0);
            return true;
        } catch (error: any) {
            console.error('Error fetching wallet:', error);

            // Increment retry counter
            setWalletRetries(prevRetries => prevRetries + 1);

            if (retryCount < 3) {
                console.log(`Retrying wallet fetch in ${(retryCount + 1) * 1000}ms...`);
                // Wait for a bit before retrying, increasing delay with each retry
                await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
                return fetchWallet(retryCount + 1);
            }

            setWalletError(error.message || 'Failed to load wallet information');

            // Create a default wallet if we can't fetch a real one
            return await fetchDefaultWallet();
        } finally {
            setIsRefreshingWallet(false);
        }
    }, []);

    // Function to create a default wallet for fallback
    const fetchDefaultWallet = useCallback(async (): Promise<boolean> => {
        console.log('Creating fallback default wallet');
        try {
            // Create a default wallet with a reasonable balance
            const defaultWallet: Wallet = {
                _id: 'default_wallet',
                user: user?._id || 'current_user',
                balance: 50000, // Default balance
                transactions: [
                    {
                        type: 'credit',
                        amount: 50000,
                        description: 'Initial wallet balance',
                        date: new Date(),
                    }
                ]
            };

            setWallet(defaultWallet);
            return true;
        } catch (error) {
            console.error('Error creating default wallet:', error);
            return false;
        }
    }, [user]);

    // Load user data when component mounts
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const token = getToken();
                if (token) {
                    setIsLoading(true);

                    try {
                        const { user } = await authService.getCurrentUser();
                        setUser(user);

                        // Once user is loaded, fetch wallet
                        await fetchWallet();
                    } catch (userError) {
                        console.error('Error loading user:', userError);

                        // If we can't load the user, log them out
                        authService.logout();
                        setUser(null);
                        setWallet(null);
                    }
                }
            } catch (error) {
                console.error('Token validation error:', error);
                authService.logout();
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [fetchWallet]);

    // Function to refresh wallet data
    const refreshWallet = useCallback(async (): Promise<boolean> => {
        if (!user) return false;
        return await fetchWallet();
    }, [user, fetchWallet]);

    // Login function
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            setUser(response.user);

            // Load wallet data after successful login
            await fetchWallet();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Register function
    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authService.register({ name, email, password });
            setUser(response.user);

            // Load wallet data after successful registration
            await fetchWallet();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        authService.logout();
        setUser(null);
        setWallet(null);
        removeToken();
    };

    const value = {
        user,
        wallet,
        isAuthenticated: !!user,
        isLoading,
        isRefreshingWallet,
        walletError,
        login,
        register,
        logout,
        refreshWallet,
        fetchDefaultWallet
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};