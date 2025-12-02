# 使用 Neon 数据库推送配置指南

## 📋 前提条件

- ✅ 已注册 Neon 账号
- ✅ 已创建 Neon 项目
- ✅ 已获取数据库连接字符串

---

## 🚀 配置步骤

### 步骤 1: 获取 Neon 连接字符串

1. **登录 Neon Dashboard**
   - 访问 [console.neon.tech](https://console.neon.tech)

2. **复制连接字符串**
   - 在项目 Dashboard 找到 **Connection String**
   - 格式示例：
     ```
     postgresql://username:password@ep-cool-bonus-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```

3. **重要参数说明**
   - `username`: 数据库用户名
   - `password`: 数据库密码
   - `ep-cool-bonus-123456`: Neon 端点 ID
   - `us-east-2`: 区域
   - `neondb`: 数据库名称
   - `?sslmode=require`: SSL 连接模式（必需）

---

### 步骤 2: 更新本地环境变量

**编辑 `.env.local` 文件**（已自动创建），替换以下变量：

```env
# 1. 替换为你的 Neon 连接字符串
DATABASE_URL="postgresql://你的用户名:你的密码@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# 2. 替换为生成的 NextAuth 密钥
NEXTAUTH_SECRET="fiHPNtBKiOWc6uxSqcpaUiy0o317xvU98Pv8skKrU1c="

# 3. 替换为你的 Story Protocol 私钥（测试钱包）
STORY_PRIVATE_KEY="0x你的私钥"

# 4. 替换为你的 Coinbase CDP API 密钥
NEXT_PUBLIC_CDP_CLIENT_API_KEY="你的API密钥"
```

---

### 步骤 3: 推送数据库 Schema

**运行以下命令**（按顺序执行）：

```bash
# 1. 生成 Prisma Client
npx prisma generate

# 2. 推送数据库 Schema 到 Neon
npx prisma db push

# 3. （可选）查看数据库结构
npx prisma studio
```

#### 预期输出：

```
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client

Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "neondb"

🚀  Your database is now in sync with your Prisma schema. Done in 2.34s

✔ Generated Prisma Client
```

---

### 步骤 4: 验证数据库连接

**方法 A: 使用 Prisma Studio**

```bash
npx prisma studio
```

- 浏览器自动打开 `http://localhost:5555`
- 查看数据库表结构（User、IPAsset、License 等）

**方法 B: 在 Neon Console 查看**

1. 打开 Neon Dashboard
2. 进入 **Tables** 标签
3. 确认表已创建：
   - ✅ User
   - ✅ IPAsset
   - ✅ DerivativeRelation
   - ✅ License
   - ✅ Transaction
   - ✅ LicenseTemplate

---

## 📊 数据库表结构对比

### SQLite → PostgreSQL 迁移完成

| 表名 | 字段数 | 关系 | 索引 |
|------|--------|------|------|
| User | 7 | → IPAsset, Transaction | walletAddress (unique) |
| IPAsset | 17 | → User, License, Derivative | ipId (unique) |
| License | 6 | → IPAsset | licenseId (unique) |
| DerivativeRelation | 7 | → IPAsset (parent/child) | (parentIpId, childIpId) |
| Transaction | 8 | → User | - |
| LicenseTemplate | 10 | → User | (userId, name) |

---

## 🔧 常见问题

### 问题 1: 连接字符串格式错误

**错误信息**:
```
Error: P1001: Can't reach database server
```

**解决方案**:
1. 确保连接字符串包含 `?sslmode=require`
2. 检查用户名和密码是否正确（特殊字符需 URL 编码）
3. 确认 Neon 项目状态为 **Active**

#### 特殊字符编码表：

| 字符 | URL 编码 |
|------|----------|
| @ | %40 |
| # | %23 |
| $ | %24 |
| % | %25 |
| & | %26 |

---

### 问题 2: Prisma Client 生成失败

**错误信息**:
```
Error: Environment variable not found: DATABASE_URL
```

**解决方案**:
```bash
# 1. 检查 .env.local 文件是否存在
Get-Content .env.local

# 2. 重新加载环境变量
$env:DATABASE_URL="postgresql://..."

# 3. 重新生成 Client
npx prisma generate
```

---

### 问题 3: 表结构推送失败

**错误信息**:
```
Error: Database reset failed
```

**解决方案**:
```bash
# 方法 1: 强制推送（会删除现有数据）
npx prisma db push --force-reset

# 方法 2: 使用迁移（推荐生产环境）
npx prisma migrate dev --name init
```

---

### 问题 4: Neon 数据库处于 Idle 状态

**现象**: 第一次连接时延迟较高

**原因**: Neon 免费计划会在 5 分钟无活动后自动休眠

**解决方案**:
- 等待 3-5 秒自动唤醒
- 或升级到付费计划（无休眠）

---

## ✅ 推送完成检查清单

完成以下检查后，你的数据库就配置好了：

- [ ] `.env.local` 文件中 `DATABASE_URL` 已替换为 Neon 连接字符串
- [ ] `prisma/schema.prisma` 中 `provider = "postgresql"`
- [ ] 运行 `npx prisma generate` 成功
- [ ] 运行 `npx prisma db push` 成功
- [ ] Neon Console 显示所有表已创建
- [ ] Prisma Studio 能正常打开并查看表结构
- [ ] 本地开发服务器能正常连接数据库

---

## 🎯 下一步操作

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 在浏览器访问
# http://localhost:3000
```

### 部署到 Vercel

1. **配置 Vercel 环境变量**
   - 在 Vercel 项目设置中添加 `DATABASE_URL`（使用相同的 Neon 连接字符串）

2. **推送代码**
   ```bash
   git add .
   git commit -m "feat: migrate to Neon PostgreSQL"
   git push
   ```

3. **自动部署**
   - Vercel 自动检测变化并部署
   - 构建命令会自动运行 `prisma generate`

---

## 📚 相关资源

- [Neon 官方文档](https://neon.tech/docs)
- [Prisma + Neon 集成指南](https://www.prisma.io/docs/guides/database/neon)
- [PostgreSQL 连接字符串格式](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Neon 定价计划](https://neon.tech/pricing)（免费额度：10GB 存储 + 100 小时计算时间）

---

## 🆘 获取帮助

如果遇到问题：
1. 查看 [Neon Discord 社区](https://discord.gg/neon)
2. 查看 [Prisma Discord 社区](https://discord.gg/prisma)
3. 提交 GitHub Issue

---

**✨ 恭喜！你的 Neon 数据库配置完成！**
