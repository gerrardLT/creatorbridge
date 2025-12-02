# CreatorBridge

> 基于 Story Protocol 的 IP 资产管理平台，让创作者轻松注册、管理和授权数字知识产权。

## ✨ 功能特性

- 🔐 **Coinbase Smart Wallet** - 无需安装扩展，使用 Passkey 一键登录
- 📝 **IP 资产注册** - 将创意作品注册到 Story Protocol 链上
- 🎫 **许可证管理** - 购买和管理 IP 使用许可证
- 🔍 **资产浏览** - 探索和搜索已注册的 IP 资产
- 📊 **个人仪表盘** - 查看资产、交易历史和收益统计

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 数据库 | Prisma + SQLite |
| 区块链 | Story Protocol (Aeneid 测试网) |
| 钱包 | Coinbase Smart Wallet |
| 索引器 | Goldsky (可选) |
| 认证 | NextAuth.js |

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repo-url>
cd creatorbridge-next
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入必要的配置：

```env
# 数据库
DATABASE_URL="file:./dev.db"

# Story Protocol
STORY_RPC_URL="https://aeneid.storyrpc.io"
STORY_PRIVATE_KEY="0x你的测试钱包私钥"

# Coinbase
NEXT_PUBLIC_CDP_CLIENT_API_KEY="你的CDP客户端API密钥"

# NextAuth
NEXTAUTH_SECRET="随机生成的密钥"
NEXTAUTH_URL="http://localhost:3001"
```

> 详细配置指南请查看 [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

### 4. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3001

## 📁 项目结构

```
creatorbridge-next/
├── app/                      # Next.js 页面
│   ├── page.tsx             # 首页
│   ├── explore/             # 探索市场
│   ├── create/              # 创建 IP
│   ├── profile/             # 个人中心
│   ├── ip/[id]/             # IP 详情
│   └── api/                 # API 路由
│       ├── ip/              # IP 资产 API
│       ├── license/         # 许可证 API
│       ├── user/            # 用户 API
│       ├── indexer/         # 索引器 API
│       └── auth/            # 认证 API
│
├── components/              # React 组件
├── context/                 # 全局状态管理
├── lib/                     # 核心服务
│   ├── story-protocol.ts   # Story Protocol SDK
│   ├── coinbase-wallet.ts  # Coinbase 钱包
│   ├── goldsky.ts          # Goldsky 索引器
│   ├── auth.ts             # NextAuth 配置
│   └── db/                 # 数据库操作
│
├── prisma/                  # 数据库模型
├── subgraph/                # Goldsky Subgraph (可选)
└── types/                   # TypeScript 类型
```

## 🔌 API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/ip` | GET | 获取 IP 资产列表 |
| `/api/ip` | POST | 注册新 IP 资产 |
| `/api/ip/[id]` | GET | 获取 IP 详情 |
| `/api/license` | GET | 获取用户许可证 |
| `/api/license` | POST | 购买许可证 |
| `/api/user` | POST | 创建/更新用户 |
| `/api/indexer` | GET | 查询索引数据 |
| `/api/auth/*` | * | NextAuth 认证 |

## 🔗 Story Protocol 集成

项目集成了 Story Protocol SDK，支持以下链上操作：

- **registerIP** - 注册 IP 资产到链上
- **mintLicense** - 铸造许可证 NFT
- **attachLicenseTerms** - 附加许可条款
- **registerDerivative** - 注册衍生作品

## 📱 钱包连接

使用 Coinbase Smart Wallet，支持：

- **Passkey 登录** - 使用 Windows Hello / Touch ID / Face ID
- **手机扫码** - 使用 Coinbase App 扫码登录

## 🌐 网络配置

| 网络 | Chain ID | RPC URL |
|------|----------|---------|
| Aeneid (测试网) | 1315 | https://aeneid.storyrpc.io |
| Mainnet | 1514 | https://mainnet.storyrpc.io |

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
