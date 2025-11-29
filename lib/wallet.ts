// 通用钱包连接 - 支持 MetaMask、Coinbase Wallet 等

export type WalletType = 'metamask' | 'coinbase' | 'injected';

// 检测可用的钱包
export function detectWallets(): WalletType[] {
  if (typeof window === 'undefined') return [];
  
  const wallets: WalletType[] = [];
  const ethereum = (window as any).ethereum;
  
  if (ethereum) {
    if (ethereum.isMetaMask) wallets.push('metamask');
    if (ethereum.isCoinbaseWallet) wallets.push('coinbase');
    if (!ethereum.isMetaMask && !ethereum.isCoinbaseWallet) wallets.push('injected');
  }
  
  return wallets;
}

// 获取 Provider
export function getProvider() {
  if (typeof window === 'undefined') return null;
  return (window as any).ethereum;
}

// 连接钱包
export async function connectWallet(): Promise<string | null> {
  try {
    const provider = getProvider();
    if (!provider) {
      alert('请安装 MetaMask 或 Coinbase Wallet 扩展！');
      return null;
    }
    
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    return accounts[0] || null;
  } catch (error: any) {
    if (error.code === 4001) {
      console.log('用户拒绝连接');
    } else {
      console.error('连接钱包失败:', error);
    }
    return null;
  }
}

// 断开连接
export async function disconnectWallet(): Promise<void> {
  // 大多数钱包不支持程序化断开，只能清除本地状态
  console.log('钱包已断开');
}

// 获取已连接地址
export async function getConnectedAddress(): Promise<string | null> {
  try {
    const provider = getProvider();
    if (!provider) return null;
    
    const accounts = await provider.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  } catch {
    return null;
  }
}

// 签名消息
export async function signMessage(message: string): Promise<string | null> {
  try {
    const provider = getProvider();
    if (!provider) return null;
    
    const address = await getConnectedAddress();
    if (!address) return null;
    
    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, address],
    });
    
    return signature as string;
  } catch (error) {
    console.error('签名失败:', error);
    return null;
  }
}

// 切换网络
export async function switchToStoryNetwork(): Promise<boolean> {
  try {
    const provider = getProvider();
    if (!provider) return false;
    
    const STORY_AENEID_CHAIN_ID = '0x523'; // 1315 in hex
    
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: STORY_AENEID_CHAIN_ID }],
      });
      return true;
    } catch (switchError: any) {
      // 如果网络不存在，添加它
      if (switchError.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: STORY_AENEID_CHAIN_ID,
            chainName: 'Story Aeneid Testnet',
            nativeCurrency: {
              name: 'IP',
              symbol: 'IP',
              decimals: 18,
            },
            rpcUrls: ['https://aeneid.storyrpc.io'],
            blockExplorerUrls: ['https://aeneid.storyscan.io'],
          }],
        });
        return true;
      }
      throw switchError;
    }
  } catch (error) {
    console.error('切换网络失败:', error);
    return false;
  }
}

// 获取当前链 ID
export async function getChainId(): Promise<number | null> {
  try {
    const provider = getProvider();
    if (!provider) return null;
    
    const chainId = await provider.request({ method: 'eth_chainId' });
    return parseInt(chainId as string, 16);
  } catch {
    return null;
  }
}

// 监听账户变化
export function onAccountsChanged(callback: (accounts: string[]) => void): void {
  const provider = getProvider();
  if (provider) {
    provider.on('accountsChanged', callback);
  }
}

// 监听网络变化
export function onChainChanged(callback: (chainId: string) => void): void {
  const provider = getProvider();
  if (provider) {
    provider.on('chainChanged', callback);
  }
}
