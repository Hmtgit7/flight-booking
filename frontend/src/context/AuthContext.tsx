// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { authService } from '../services/auth-service';
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
    updateUserWallet: (wallet: Wallet) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = getToken();
                if (token) {
                    const { user, wallet } = await authService.getCurrentUser();
                    setUser(user);
                    setWallet(wallet);
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

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            setUser(response.user);
            setWallet(response.wallet);
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
            setWallet(response.wallet);
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

    const updateUserWallet = (newWallet: Wallet) => {
        setWallet(newWallet);
    };

    const value = {
        user,
        wallet,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserWallet
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

