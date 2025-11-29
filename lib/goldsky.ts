'use server';

import { GraphQLClient, gql } from 'graphql-request';

// Goldsky 配置
const GOLDSKY_ENDPOINT = process.env.GOLDSKY_ENDPOINT || 'https://api.goldsky.com/api/public/project_xxx/subgraphs/story-protocol/v1/gn';
const GOLDSKY_API_KEY = process.env.GOLDSKY_API_KEY;

// 创建 GraphQL 客户端
function getGoldskyClient() {
  const headers: Record<string, string> = {};
  
  if (GOLDSKY_API_KEY) {
    headers['Authorization'] = `Bearer ${GOLDSKY_API_KEY}`;
  }

  return new GraphQLClient(GOLDSKY_ENDPOINT, { headers });
}

// IP 资产类型
export interface IndexedIPAsset {
  id: string;
  ipId: string;
  owner: string;
  name: string;
  description: string;
  imageUrl: string;
  registrationDate: string;
  blockNumber: string;
  transactionHash: string;
}

// 查询 IP 资产列表
export async function queryIPAssets(params: {
  first?: number;
  skip?: number;
  owner?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}): Promise<{ assets: IndexedIPAsset[]; total: number }> {
  const { first = 20, skip = 0, owner, orderBy = 'registrationDate', orderDirection = 'desc' } = params;

  try {
    const client = getGoldskyClient();

    const query = gql`
      query GetIPAssets($first: Int!, $skip: Int!, $owner: String, $orderBy: String!, $orderDirection: String!) {
        ipAssets(
          first: $first
          skip: $skip
          where: { owner: $owner }
          orderBy: $orderBy
          orderDirection: $orderDirection
        ) {
          id
          ipId
          owner
          name
          description
          imageUrl
          registrationDate
          blockNumber
          transactionHash
        }
      }
    `;

    const variables = {
      first,
      skip,
      owner: owner || undefined,
      orderBy,
      orderDirection,
    };

    const data = await client.request<{ ipAssets: IndexedIPAsset[] }>(query, variables);
    
    return {
      assets: data.ipAssets || [],
      total: data.ipAssets?.length || 0,
    };
  } catch (error) {
    console.error('Goldsky query failed:', error);
    // 返回空结果，让调用方使用备用数据源
    return { assets: [], total: 0 };
  }
}

// 根据 ID 获取单个 IP 资产
export async function getIPById(ipId: string): Promise<IndexedIPAsset | null> {
  try {
    const client = getGoldskyClient();

    const query = gql`
      query GetIPAsset($ipId: String!) {
        ipAsset(id: $ipId) {
          id
          ipId
          owner
          name
          description
          imageUrl
          registrationDate
          blockNumber
          transactionHash
        }
      }
    `;

    const data = await client.request<{ ipAsset: IndexedIPAsset | null }>(query, { ipId });
    return data.ipAsset;
  } catch (error) {
    console.error('Goldsky query failed:', error);
    return null;
  }
}

// 搜索 IP 资产
export async function searchIPAssets(searchTerm: string, limit: number = 20): Promise<IndexedIPAsset[]> {
  try {
    const client = getGoldskyClient();

    const query = gql`
      query SearchIPAssets($searchTerm: String!, $limit: Int!) {
        ipAssets(
          first: $limit
          where: { name_contains_nocase: $searchTerm }
          orderBy: registrationDate
          orderDirection: desc
        ) {
          id
          ipId
          owner
          name
          description
          imageUrl
          registrationDate
          blockNumber
          transactionHash
        }
      }
    `;

    const data = await client.request<{ ipAssets: IndexedIPAsset[] }>(query, { searchTerm, limit });
    return data.ipAssets || [];
  } catch (error) {
    console.error('Goldsky search failed:', error);
    return [];
  }
}

// 获取用户的 IP 资产
export async function getIPAssetsByOwner(owner: string): Promise<IndexedIPAsset[]> {
  const result = await queryIPAssets({ owner, first: 100 });
  return result.assets;
}

// 检查索引器是否可用
export async function isIndexerAvailable(): Promise<boolean> {
  try {
    const client = getGoldskyClient();
    
    const query = gql`
      query HealthCheck {
        _meta {
          block {
            number
          }
        }
      }
    `;

    await client.request(query);
    return true;
  } catch {
    return false;
  }
}
