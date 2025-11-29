# CreatorBridge 配置指南

本指南将帮助你配置项目所需的所有外部服务。

## 📋 需要配置的服务

| 服务 | 必需性 | 用途 |
|------|--------|------|
| Story Protocol | ✅ 必需 | IP 资产注册和许可证管理 |
| Coinbase Developer Platform | ✅ 必需 | 钱包连接 |
| Goldsky | ⚡ 推荐 | 链上数据索引（可选，有数据库备份） |
| NextAuth | ✅ 必需 | 用户认证 |

---

## 1️⃣ Story Protocol 配置

Story Protocol 是核心的 IP 协议层，用于链上 IP 注册。

### 步骤 1: 获取测试网 ETH

1. 访问 [Story Protocol Faucet](https://faucet.story.foundation/)
2. 连接你的钱包
3. 领取测试网 ETH（用于支付 Gas 费）

### 步骤 2: 获取私钥

⚠️ **安全警告**: 仅使用测试钱包，不要使用主网钱包！

1. 创建一个新的测试钱包（推荐使用 MetaMask）
2. 导出私钥：
   - MetaMask → 账户详情 → 导出私钥
3. 复制私钥（以 `0x` 开头的 64 位十六进制字符串）

### 步骤 3: 配置环境变量

```env
# Story Protocol
STORY_RPC_URL="https://aeneid.storyrpc.io"
STORY_PRIVATE_KEY="0x你的私钥..."
```

### Story Protocol 网络信息

| 网络 | Chain ID | RPC URL |
|------|----------|---------|
| Aeneid (测试网) | 1315 | https://aeneid.storyrpc.io |
| Mainnet | 1514 | https://mainnet.storyrpc.io |

---

## 2️⃣ Coinbase Developer Platform 配置

用于 Coinbase Smart Wallet 集成。

### 步骤 1: 创建 CDP 项目

1. 访问 [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. 登录或注册账户
3. 点击 "Create Project"
4. 填写项目信息：
   - Project Name: `CreatorBridge`
   - Description: `IP Asset Management Platform`

### 步骤 2: 获取 API Key

1. 进入项目设置
2. 点击 "API Keys" 标签
3. 点击 "Create API Key"
4. 选择权限：
   - ✅ Wallet API
   - ✅ Onchain Data API
5. 复制 Client API Key

### 步骤 3: 配置环境变量

```env
# Coinbase Wallet
NEXT_PUBLIC_CDP_CLIENT_API_KEY="你的CDP客户端API密钥"
```

---

## 3️⃣ Goldsky Subgraph 配置（可选）

Goldsky 提供链上数据索引服务，加速数据查询。以下是最新的部署步骤。

### 步骤 1: 安装 Goldsky CLI

**macOS / Linux:**
```bash
curl https://goldsky.com | sh
```

**Windows (需要 Node.js):**
```bash
npm install -g @goldskycom/cli
```

### 步骤 2: 创建 Goldsky 账户并登录

1. 访问 [app.goldsky.com](https://app.goldsky.com/) 注册账户
2. 进入 **Project Settings** → **API Keys**
3. 创建并复制 API Key
4. 在终端登录：

```bash
goldsky login
# 按提示输入 API Key
```

验证登录成功：
```bash
goldsky
# 应显示可用命令列表
```

### 步骤 3: 部署 Subgraph

**方式 A: 从本地部署（推荐）**

如果你有 subgraph 源码：
```bash
# 进入 subgraph 目录
cd your-subgraph

# 部署到 Goldsky
goldsky subgraph deploy my-subgraph/1.0.0 --path .
```

**方式 B: 从 IPFS Hash 部署**

如果你有已部署的 subgraph IPFS hash：
```bash
goldsky subgraph deploy story-protocol/1.0.0 --from-ipfs-hash QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**方式 C: 从 ABI 生成（无代码方式）**

创建配置文件 `config.json`：
```json
{
  "name": "story-ip-assets",
  "chains": ["story-testnet"],
  "abis": {
    "IPAssetRegistry": "./abis/IPAssetRegistry.json"
  },
  "instances": [
    {
      "abi": "IPAssetRegistry",
      "address": "0x...",
      "startBlock": 1000000
    }
  ]
}
```

然后部署：
```bash
goldsky subgraph deploy story-ip-assets/1.0 --from-abi config.json
```

### 步骤 4: 查看部署状态

```bash
# 列出所有已部署的 subgraph
goldsky subgraph list
```

### 步骤 5: 获取 GraphQL Endpoint

部署成功后，在 [app.goldsky.com](https://app.goldsky.com/) Dashboard 中：

1. 选择你的 Subgraph
2. 复制 **GraphQL Endpoint URL**
3. 格式类似：`https://api.goldsky.com/api/public/project_xxx/subgraphs/story-protocol/1.0.0/gn`

### 步骤 6: 配置环境变量

```env
# Goldsky Indexer
GOLDSKY_API_KEY="你的Goldsky API密钥"
GOLDSKY_ENDPOINT="https://api.goldsky.com/api/public/project_xxx/subgraphs/story-protocol/1.0.0/gn"
```

### 测试 GraphQL 查询

```graphql
query {
  _meta {
    deployment
    block {
      number
    }
  }
}
```

### Goldsky 定价

| 计划 | 价格 | 查询限制 |
|------|------|----------|
| Free | $0/月 | 10万次查询/月 |
| Growth | $99/月 | 更高限制 |
| Scale | 联系销售 | 无限制 |

> 💡 **提示**: 如果不配置 Goldsky，系统会自动使用本地 SQLite 数据库作为备份，功能不受影响。

---

## 4️⃣ NextAuth 配置

用于用户认证和会话管理。

### 步骤 1: 生成 Secret

在终端运行：

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

### 步骤 2: 配置环境变量

```env
# NextAuth
NEXTAUTH_SECRET="生成的随机字符串"
NEXTAUTH_URL="http://localhost:3000"
```

> 生产环境需要将 `NEXTAUTH_URL` 改为你的域名。

---

## 5️⃣ 数据库配置

项目使用 SQLite 作为本地数据库（开发环境）。

### 默认配置（无需修改）

```env
# Database
DATABASE_URL="file:./dev.db"
```

### 初始化数据库

```bash
cd creatorbridge-next

# 生成 Prisma 客户端
npx prisma generate

# 创建数据库表
npx prisma db push

# （可选）添加测试数据
npx prisma db seed
```

---

## 📝 完整的 .env 文件示例

```env
# ===================
# 数据库
# ===================
DATABASE_URL="file:./dev.db"

# ===================
# Story Protocol
# ===================
STORY_RPC_URL="https://aeneid.storyrpc.io"
STORY_PRIVATE_KEY="0x你的测试钱包私钥"

# ===================
# Coinbase Wallet
# ===================
NEXT_PUBLIC_CDP_CLIENT_API_KEY="你的CDP客户端API密钥"

# ===================
# Goldsky (可选)
# ===================
GOLDSKY_API_KEY="你的Goldsky API密钥"
GOLDSKY_ENDPOINT="https://api.goldsky.com/api/public/project_xxx/subgraphs/story-protocol/v1/gn"

# ===================
# NextAuth
# ===================
NEXTAUTH_SECRET="随机生成的32位字符串"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🚀 启动项目

配置完成后，运行以下命令：

```bash
cd creatorbridge-next

# 安装依赖
npm install

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看项目。

---

## ❓ 常见问题

### Q: Story Protocol 私钥从哪里获取？
A: 使用 MetaMask 或其他钱包创建一个新的测试账户，然后导出私钥。**切勿使用主网钱包！**

### Q: 没有 Goldsky 账户怎么办？
A: 可以跳过 Goldsky 配置，系统会自动使用本地数据库。功能不受影响，只是查询速度可能稍慢。

### Q: CDP API Key 申请需要审核吗？
A: 不需要，注册后即可立即获取 API Key。

### Q: 生产环境需要修改什么？
A: 
1. 将 `NEXTAUTH_URL` 改为你的域名
2. 将 `DATABASE_URL` 改为生产数据库（如 PostgreSQL）
3. 将 Story Protocol 网络改为 Mainnet

---

## 📚 相关文档

- [Story Protocol 文档](https://docs.story.foundation/)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)
- [Goldsky 文档](https://docs.goldsky.com/)
- [NextAuth.js 文档](https://next-auth.js.org/)
- [Prisma 文档](https://www.prisma.io/docs)
