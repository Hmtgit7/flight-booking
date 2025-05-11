// src/components/layout/WalletDisplay.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/format';
import { walletService } from '../../services/wallet-service';
import Loader from '../ui/Loader';
import { getConnectionStatus } from '../../services/api';

// Different states the wallet display can be in
type WalletState = 'loading' | 'error' | 'success' | 'offline';

const WalletDisplay: React.FC = () => {
    const { wallet, refreshWallet, isRefreshingWallet, walletError } = useAuth();
    const [displayWallet, setDisplayWallet] = useState<any>(null);
    const [walletState, setWalletState] = useState<WalletState>('loading');
    const [retryCount, setRetryCount] = useState(0);

    // Load wallet when component mounts
    useEffect(() => {
        const loadWallet = async () => {
            // If we have a wallet from context, use it
            if (wallet) {
                setDisplayWallet(wallet);
                setWalletState('success');
                return;
            }

            // If we're still refreshing, show loading state
            if (isRefreshingWallet) {
                setWalletState('loading');
                return;
            }

            // If there's an error but we haven't tried to refresh yet
            if (walletError && retryCount < 2) {
                setWalletState('error');
                // Auto retry after a delay
                const timeout = setTimeout(() => {
                    refreshWallet();
                    setRetryCount(prev => prev + 1);
                }, 3000);
                return () => clearTimeout(timeout);
            }

            // If offline or exhausted retries, try to get fallback wallet
            try {
                const isOnline = getConnectionStatus();
                if (!isOnline || (walletError && retryCount >= 2)) {
                    const fallbackWallet = await walletService.getFallbackWallet();
                    setDisplayWallet(fallbackWallet);
                    setWalletState(isOnline ? 'success' : 'offline');
                }
            } catch (err) {
                console.error("Failed to get fallback wallet:", err);
                setWalletState('error');
            }
        };

        loadWallet();
    }, [wallet, isRefreshingWallet, walletError, refreshWallet, retryCount]);

    // Refresh wallet with exponential backoff on manual retry
    const handleRetry = () => {
        refreshWallet();
        setRetryCount(prev => prev + 1);
    };

    // Render appropriate display based on state
    const renderWalletContent = () => {
        switch (walletState) {
            case 'loading':
                return (
                    <div className="flex items-center px-4 py-3">
                        <Loader size="sm" />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading wallet...</span>
                    </div>
                );

            case 'error':
                return (
                    <div className="px-4 py-3">
                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                            {walletError || "Failed to load wallet"}
                        </p>
                        <button
                            onClick={handleRetry}
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Retry
                        </button>
                    </div>
                );

            case 'offline':
                return (
                    <div className="px-4 py-3">
                        <div className="flex items-center mb-1">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">Offline Mode</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {displayWallet ? formatCurrency(displayWallet.balance) : 'N/A'}
                        </p>
                    </div>
                );

            case 'success':
                return (
                    <div className="px-4 py-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Wallet Balance</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {displayWallet ? formatCurrency(displayWallet.balance) : 'N/A'}
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            {renderWalletContent()}
        </div>
    );
};

export default WalletDisplay;