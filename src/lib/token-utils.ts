import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// 代币账户信息接口
export interface TokenAccount {
  address: string;
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  tokenInfo?: {
    name: string;
    image: string;
  };
}

// Helius API 返回的资产信息接口
interface HeliusAsset {
  interface: string;
  id: string;
  content: {
    json_uri: string;
    files: Array<{
      uri: string;
      cdn_uri: string;
      mime: string;
    }>;
    metadata: {
      attributes: Array<{
        value: string;
        trait_type: string;
      }>;
      description: string;
      name: string;
      symbol: string;
    };
  };
}

// 默认代币图标
const DEFAULT_TOKEN_ICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMjRDMTguNjI3NCAyNCAyNCAxOC42Mjc0IDI0IDEyQzI0IDUuMzcyNTggMTguNjI3NCAwIDEyIDBDNS4zNzI1OCAwIDAgNS4zNzI1OCAwIDEyQzAgMTguNjI3NCA1LjM3MjU4IDI0IDEyIDI0WiIgZmlsbD0iI0Q5RDlEOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2NjY2Ij4/PC90ZXh0Pjwvc3ZnPg==';

// 获取代币图标
export const getTokenIcon = (account: TokenAccount) => {
  if (!account.tokenInfo?.image) return DEFAULT_TOKEN_ICON;
  
  // 检查是否是 base64 编码的图片
  if (account.tokenInfo.image.startsWith('data:')) {
    return account.tokenInfo.image;
  }

  // 检查是否是 IPFS 链接
  if (account.tokenInfo.image.startsWith('ipfs://')) {
    const ipfsHash = account.tokenInfo.image.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  }

  // 检查是否已经是 ipfs.io 链接
  if (account.tokenInfo.image.includes('ipfs.io/ipfs/')) {
    return account.tokenInfo.image;
  }

  // 检查是否是 Arweave 链接
  if (account.tokenInfo.image.startsWith('ar://')) {
    const arweaveHash = account.tokenInfo.image.replace('ar://', '');
    return `https://arweave.net/${arweaveHash}`;
  }

  // 检查是否是原始 IPFS hash（不带协议前缀）
  if (account.tokenInfo.image.startsWith('Qm') && account.tokenInfo.image.length === 46) {
    return `https://ipfs.io/ipfs/${account.tokenInfo.image}`;
  }

  // 返回原始链接
  return account.tokenInfo.image;
};

// 获取用户钱包中的代币
export const fetchTokenAccounts = async (connection: Connection, publicKey: PublicKey): Promise<TokenAccount[]> => {
  try {
    // 获取所有代币账户
    const accounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    // 处理账户数据
    const processedAccounts = accounts.value.map(item => {
      const accountInfo = item.account.data.parsed.info;
      return {
        address: item.pubkey.toString(),
        mint: accountInfo.mint,
        amount: accountInfo.tokenAmount.amount,
        decimals: accountInfo.tokenAmount.decimals,
        uiAmount: accountInfo.tokenAmount.uiAmount,
        tokenInfo: {
          name: `未知代币 (${accountInfo.mint.slice(0, 4)}...${accountInfo.mint.slice(-4)})`,
          image: DEFAULT_TOKEN_ICON
        }
      };
    });

    // 收集所有代币的 mint 地址
    const mintAddresses = processedAccounts.map(account => account.mint);

    // 检查环境变量
    const heliusUrl = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
    const heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

    if (!heliusUrl || !heliusApiKey) {
      console.error('缺少 Helius API 配置');
      return processedAccounts;
    }

    // 调用 Helius API 获取代币信息
    const response = await fetch(`${heliusUrl}/?api-key=${heliusApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'test',
        method: 'getAssetBatch',
        params: {
          ids: mintAddresses
        }
      })
    });

    const assetData = await response.json();
    
    // 创建 mint 地址到资产信息的映射
    const assetMap = new Map<string, TokenAccount['tokenInfo']>();
    if (assetData.result) {
      assetData.result.forEach((asset: HeliusAsset) => {
        // 获取图片 URI
        let imageUri = '';
        if (asset.content?.files?.[0]?.uri) {
          imageUri = asset.content.files[0].uri;
        } else if (asset.content?.files?.[0]?.cdn_uri) {
          imageUri = asset.content.files[0].cdn_uri;
        }

        // 获取名称
        const name = asset.content?.metadata?.name || '未知代币';

        assetMap.set(asset.id, {
          name: name,
          image: imageUri
        });
      });
    }

    // 将资产信息添加到账户数据中
    return processedAccounts.map(account => {
      const tokenInfo = assetMap.get(account.mint) || account.tokenInfo;
      return {
        ...account,
        tokenInfo
      };
    });
  } catch (error) {
    console.error('获取代币账户失败:', error);
    return [];
  }
}; 