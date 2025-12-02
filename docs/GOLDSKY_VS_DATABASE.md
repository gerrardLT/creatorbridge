# Goldsky vs 数据库 - 完整对比分析

## 📊 核心问题：能否用 Goldsky 完全替代数据库？

**答案：不能完全替代，但可以大幅减少数据库使用**

---

## 一、功能对比表

| 数据类型 | Goldsky | PostgreSQL/SQLite | 推荐方案 |
|----------|---------|-------------------|----------|
| **链上 IP 资产** | ✅ 可以 | ✅ 可以 | 🟢 Goldsky（主）+ DB（缓存） |
| **许可证购买记录** | ✅ 可以 | ✅ 可以 | 🟢 Goldsky（主）+ DB（缓存） |
| **衍生作品关系** | ✅ 可以 | ✅ 可以 | 🟢 Goldsky（主）+ DB（缓存） |
| **用户信息** | ❌ 不能 | ✅ 必需 | 🔴 **必须用数据库** |
| **NextAuth 会话** | ❌ 不能 | ✅ 必需 | 🔴 **必须用数据库** |
| **许可证模板** | ❌ 不能 | ✅ 必需 | 🔴 **必须用数据库** |
| **草稿数据（未上链）** | ❌ 不能 | ✅ 必需 | 🔴 **必须用数据库** |
| **收益统计** | ⚠️ 部分 | ✅ 可以 | 🟡 混合使用 |

---

## 二、数据分类详解

### 2.1 可以用 Goldsky 的数据（链上数据）

```typescript
// ✅ IP 资产注册事件
event IPRegistered(
  address indexed ipId,
  address indexed owner,
  string name,
  string description,
  string imageUrl
)

// ✅ 许可证铸造事件
event LicenseTokensMinted(
  address indexed licensorIpId,
  address indexed receiver,
  uint256 licenseTermsId,
  uint256 amount
)

// ✅ 衍生作品注册事件
event DerivativeRegistered(
  address indexed childIpId,
  address[] parentIpIds,
  uint256[] licenseTermsIds
)
```

**Goldsky 查询示例：**
```graphql
query GetIPAssets {
  ipAssets(
    orderBy: registrationDate
    orderDirection: desc
    first: 20
  ) {
    id
    ipId
    owner
    name
    description
    imageUrl
    registrationDate
    transactionHash
  }
}
```

---

### 2.2 必须用数据库的数据（非链上数据）

#### **User 表（必需）**
```typescript
// ❌ Goldsky 无法存储
// ✅ 必须用数据库
model User {
  id            String    @id
  walletAddress String    @unique
  name          String?   // 用户可自定义昵称
  email         String?   // 用户邮箱
  avatarUrl     String?   // 用户头像
  createdAt     DateTime
  updatedAt     DateTime
}
```

**原因：**
- NextAuth 需要用户会话管理
- 用户可以修改昵称、头像（不上链）
- 需要存储用户偏好设置

---

#### **LicenseTemplate 表（必需）**
```typescript
// ❌ Goldsky 无法存储
// ✅ 必须用数据库
model LicenseTemplate {
  id                 String
  userId             String
  name               String   // 模板名称
  licenseType        String
  mintingFee         String?
  commercialRevShare Int?
  customTerms        String?  // 自定义条款
}
```

**原因：**
- 这是用户保存的许可证配置模板
- 纯前端功能，不涉及链上交易
- 用于快速复用许可证配置

---

## 三、混合架构方案（推荐）

### 方案 A：Goldsky 优先 + 轻量级数据库

```
┌─────────────────────────────────────┐
│         数据存储策略                 │
├─────────────────────────────────────┤
│ Goldsky (链上数据，只读)             │
│ ├─ IP 资产列表                       │
│ ├─ 许可证购买记录                    │
│ ├─ 衍生作品关系                      │
│ └─ 收益数据                          │
├─────────────────────────────────────┤
│ PostgreSQL (用户数据，读写)          │
│ ├─ User 表                          │
│ ├─ LicenseTemplate 表               │
│ └─ NextAuth Session 表              │
└─────────────────────────────────────┘
```

**优势：**
- ✅ 减少 90% 数据库查询
- ✅ 降低数据库成本
- ✅ 提高查询速度（Goldsky CDN）
- ✅ 数据完全去中心化

**劣势：**
- ⚠️ 需要部署 Goldsky Subgraph
- ⚠️ 仍需小型数据库

---

### 方案 B：完全数据库（当前方案）

```
┌─────────────────────────────────────┐
│         数据存储策略                 │
├─────────────────────────────────────┤
│ PostgreSQL (所有数据)                │
│ ├─ User 表                          │
│ ├─ IPAsset 表（包含链上+链下数据）   │
│ ├─ License 表                       │
│ ├─ DerivativeRelation 表            │
│ ├─ Transaction 表                   │
│ └─ LicenseTemplate 表               │
└─────────────────────────────────────┘
```

**优势：**
- ✅ 无需配置 Goldsky
- ✅ 开发简单
- ✅ 数据一致性好

**劣势：**
- ⚠️ 数据库负载高
- ⚠️ 查询速度较慢
- ⚠️ 成本较高（大型应用）

---

## 四、实施建议

### 4.1 最小化数据库方案（推荐用 Goldsky）

如果你想最小化数据库使用，只保留必需表：

```prisma
// schema.prisma - 精简版

// ✅ 必须保留
model User {
  id            String    @id @default(cuid())
  walletAddress String    @unique
  name          String?
  email         String?   @unique
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  licenseTemplates LicenseTemplate[]
}

// ✅ 必须保留
model LicenseTemplate {
  id                 String   @id @default(cuid())
  userId             String
  name               String
  licenseType        String
  mintingFee         String?
  commercialRevShare Int?
  customTerms        String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  user               User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, name])
}

// ❌ 可以删除（改用 Goldsky）
// model IPAsset { ... }
// model License { ... }
// model DerivativeRelation { ... }
// model Transaction { ... }
```

---

### 4.2 代码改造示例

#### **Before（使用数据库）：**
```typescript
// app/api/ip/route.ts
export async function GET(request: NextRequest) {
  const { assets } = await findAllIPAssets(); // 查询数据库
  return NextResponse.json({ assets });
}
```

#### **After（使用 Goldsky）：**
```typescript
// app/api/ip/route.ts
import { queryIPAssets } from '@/lib/goldsky';

export async function GET(request: NextRequest) {
  const { assets } = await queryIPAssets({
    first: 20,
    orderBy: 'registrationDate',
    orderDirection: 'desc'
  }); // 查询 Goldsky
  
  return NextResponse.json({ assets });
}
```

---

## 五、Vercel 部署成本对比

### 5.1 完全数据库方案

| 项目 | 成本 |
|------|------|
| Vercel Postgres (512MB) | $20/月 |
| 或 Neon Free Tier | $0/月（有限制） |
| Goldsky | 不使用 |
| **总计** | **$0-20/月** |

---

### 5.2 Goldsky + 轻量级数据库方案

| 项目 | 成本 |
|------|------|
| Goldsky Free Tier | $0/月（10万查询） |
| Neon Free Tier (仅存 User 表) | $0/月 |
| **总计** | **$0/月** |

**节省：100% 成本！** 💰

---

## 六、推荐方案

### 🟢 **小型项目（< 1000 用户）**
```
方案：完全数据库（当前方案）
数据库：Neon Free Tier
成本：$0/月
优点：简单、快速部署
```

### 🟡 **中型项目（1000-10000 用户）**
```
方案：Goldsky + PostgreSQL
数据库：Neon Pro / Vercel Postgres
Goldsky：Free / Growth Tier
成本：$0-20/月
优点：性能好、成本低
```

### 🔴 **大型项目（> 10000 用户）**
```
方案：Goldsky + PostgreSQL + Redis
数据库：Vercel Postgres Pro
Goldsky：Scale Tier
Redis：Vercel KV
成本：$50-200/月
优点：高性能、高可用
```

---

## 七、实施步骤（如果要改用 Goldsky）

### 步骤 1: 部署 Goldsky Subgraph
```bash
# 进入 subgraph 目录
cd subgraph

# 部署到 Goldsky
goldsky subgraph deploy creatorbridge/1.0.0 --path .
```

### 步骤 2: 精简 Prisma Schema
```prisma
// 只保留 User 和 LicenseTemplate 表
// 删除 IPAsset、License、DerivativeRelation、Transaction 表
```

### 步骤 3: 重构 API 路由
```typescript
// 所有 IP 资产查询改用 Goldsky
import { queryIPAssets } from '@/lib/goldsky';
```

### 步骤 4: 测试验证
```bash
# 运行测试
npm run test

# 本地验证
npm run dev
```

---

## 八、结论

### ✅ **能用 Goldsky 替代的**（约 70% 数据）
- IP 资产数据
- 许可证购买记录
- 衍生作品关系
- 交易历史

### ❌ **不能用 Goldsky 替代的**（约 30% 数据）
- 用户信息和会话
- 许可证模板
- 草稿数据
- 用户偏好设置

---

## 🎯 最终建议

**当前阶段（Hackathon/MVP）：**
```
使用完全数据库方案（当前方案）
- 快速开发
- 无需配置 Goldsky
- Neon Free Tier 够用
```

**生产环境（正式上线）：**
```
迁移到 Goldsky + 轻量级数据库
- 性能提升 3-5 倍
- 成本降低 80%
- 数据去中心化
```

---

**总结：Goldsky 是强大的补充，但不能完全替代数据库。推荐混合使用以达到最佳性能和成本平衡。** 💡
