// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { authService } from '../services/auth-service';
import { walletService } from '../services/wallet-service';
import { getToken } from '../utils/storage';
import { Wallet } from '../types/wallet';

interface AuthContextType {
    user: User | null;
    wallet: Wallet | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshWallet: () => Promise<void>;
    isRefreshingWallet: boolean;
    walletError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshingWallet, setIsRefreshingWallet] = useState<boolean>(false);
    const [walletError, setWalletError] = useState<string | null>(null);

    // Load user data when component mounts
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = getToken();
                if (token) {
                    const { user } = await authService.getCurrentUser();
                    setUser(user);

                    // Load wallet data after user is loaded
                    await refreshWallet();
                }
            } catch (error) {
                console.error('Error loading user:', error);
                authService.logout();
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    // Function to refresh wallet balance and data
    const refreshWallet = async () => {
        if (!user) return;

        setIsRefreshingWallet(true);
        setWalletError(null);

        try {
            const walletData = await walletService.getUserWallet();
            setWallet(walletData);
        } catch (error: any) {
            console.error('Error refreshing wallet:', error);
            setWalletError(error.message || 'Failed to load wallet information');
        } finally {
            setIsRefreshingWallet(false);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            setUser(response.user);

            // Load wallet data after successful login
            try {
                const walletData = await walletService.getUserWallet();
                setWallet(walletData);
            } catch (walletError) {
                console.error('Error loading wallet after login:', walletError);
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authService.register({ name, email, password });
            setUser(response.user);

            // Load wallet data after successful registration
            try {
                const walletData = await walletService.getUserWallet();
                setWallet(walletData);
            } catch (walletError) {
                console.error('Error loading wallet after registration:', walletError);
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setWallet(null);
    };

    const value = {
        user,
        wallet,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshWallet,
        isRefreshingWallet,
        walletError
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