import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

const APP_NAME = 'CreatorBridge';
const APP_LOGO_URL = 'https://example.com/logo.png';
const DEFAULT_CHAIN_ID = 84532; // Base Sepolia

let coinbaseWallet: CoinbaseWalletSDK | null = null;
let ethereum: any = null;

export function initCoinbaseWallet() {
  if (typeof window === 'undefined') return null;
  
  if (!coinbaseWallet) {
    coinbaseWallet = new CoinbaseWalletSDK({
      appName: APP_NAME,
      appLogoUrl: APP_LOGO_URL,
    });
    
    ethereum = coinbaseWallet.makeWeb3Provider({
      options: 'all' // 支持 Smart Wallet + Coinbase Wallet Extension + 手机扫码
    });
  }
  
  return ethereum;
}

export async function connectWallet(): Promise<string | null> {
  try {
    const provider = initCoinbaseWallet();
    if (!provider) return null;
    
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return null;
  }
}

export async function disconnectWallet(): Promise<void> {
  try {
    // Reset wallet state
    coinbaseWallet = null;
    ethereum = null;
  } catch (error) {
    console.error('Failed to disconnect wallet:', error);
  }
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    const provider = initCoinbaseWallet();
    if (!provider) return null;
    
    const accounts = await provider.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  } catch (error) {
    return null;
  }
}


export async function signMessage(message: string): Promise<string | null> {
  try {
    const provider = initCoinbaseWallet();
    if (!provider) return null;
    
    const address = await getConnectedAddress();
    if (!address) return null;
    
    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, address],
    });
    
    return signature as string;
  } catch (error) {
    console.error('Failed to sign message:', error);
    return null;
  }
}

export async function switchChain(chainId: number): Promise<boolean> {
  try {
    const provider = initCoinbaseWallet();
    if (!provider) return false;
    
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    
    return true;
  } catch (error) {
    console.error('Failed to switch chain:', error);
    return false;
  }
}

export async function getChainId(): Promise<number | null> {
  try {
    const provider = initCoinbaseWallet();
    if (!provider) return null;
    
    const chainId = await provider.request({ method: 'eth_chainId' });
    return parseInt(chainId as string, 16);
  } catch (error) {
    return null;
  }
}

export function getProvider() {
  return initCoinbaseWallet();
}
