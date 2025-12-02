# Vercel 环境变量错误修复指南

## 🚨 错误信息

```
Environment Variable "DATABASE_URL" references Secret "database_url", which does not exist.
```

---

## 🔍 问题原因

这个错误是因为 `vercel.json` 中使用了 **Secret 引用语法**（`@database_url`），但没有创建对应的 Secret。

**错误配置示例**：
```json
// ❌ vercel.json
{
  "env": {
    "DATABASE_URL": "@database_url"  // 引用不存在的 Secret
  }
}
```

可能的原因：
1. ❌ `vercel.json` 中使用了 `@secret_name` 语法但没有创建 Secret
2. ❌ 在 Vercel Dashboard 添加环境变量时勾选了 "Sensitive" 选项
3. ❌ 环境变量值格式错误（如包含特殊引用语法）

**正确做法**：
- ✅ 删除 `vercel.json` 中的 `env` 配置
- ✅ 在 Vercel Dashboard 直接添加环境变量（Plain Text）

---

## ✅ 解决方案

### 方法 1: 重新添加环境变量（推荐）

#### 步骤 1: 删除错误的变量

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目 `creatorbridge`
3. 点击 **Settings** → **Environment Variables**
4. 找到 `DATABASE_URL`，点击右侧 **⋯** → **Remove**
5. 确认删除

#### 步骤 2: 正确添加 DATABASE_URL

1. **点击 "Add New" 按钮**

2. **填写变量信息**
   ```
   Name: DATABASE_URL
   ```

3. **粘贴 Neon 连接字符串（Plain Text）**
   ```
   Value: postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   
   **示例**：
   ```
   postgresql://neondb_owner:AbCdEf123456@ep-cool-bonus-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

4. **选择环境**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **⚠️ 关键：不要勾选 "Sensitive"**
   - 确保变量类型为 **Plain Text**
   - **不要选择** "Secret" 或 "Encrypted"

6. **点击 "Save"**

#### 步骤 3: 重新部署

1. 进入 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧 **⋯** → **Redeploy**
4. 选择 **Use existing Build Cache** → **Redeploy**

---

### 方法 2: 使用 Vercel CLI（高级）

如果你已安装 Vercel CLI：

```bash
# 1. 登录 Vercel
vercel login

# 2. 链接项目
vercel link

# 3. 删除错误的变量
vercel env rm DATABASE_URL production

# 4. 添加正确的变量
vercel env add DATABASE_URL production

# 按提示粘贴 Neon 连接字符串，然后回车

# 5. 同样为 Preview 和 Development 添加
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development

# 6. 重新部署
vercel --prod
```

---

## 📋 完整环境变量清单

确保以下所有变量都正确配置为 **Plain Text**：

### 必需变量

| 变量名 | 示例值 | 环境 |
|--------|--------|------|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require` | All |
| `STORY_RPC_URL` | `https://aeneid.storyrpc.io` | All |
| `STORY_PRIVATE_KEY` | `0xabcd1234...` | All |
| `NEXT_PUBLIC_CDP_CLIENT_API_KEY` | `cdp_api_key_xxx` | All |
| `NEXTAUTH_SECRET` | `fiHPNtBKiOWc6uxSqcpaUiy0o317xvU98Pv8skKrU1c=` | All |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |

### 可选变量

| 变量名 | 示例值 | 环境 |
|--------|--------|------|
| `GOLDSKY_API_KEY` | `goldsky_xxx` | All |
| `GOLDSKY_ENDPOINT` | `https://api.goldsky.com/...` | All |

---

## 🔧 常见错误模式

### 错误 1: 引用不存在的 Secret

```
❌ DATABASE_URL = @database_url
✅ DATABASE_URL = postgresql://...
```

### 错误 2: 使用引号包裹值

```
❌ DATABASE_URL = "postgresql://..."
✅ DATABASE_URL = postgresql://...
```

### 错误 3: 特殊字符未转义

```
❌ DATABASE_URL = postgresql://user:p@ssword@host/db
✅ DATABASE_URL = postgresql://user:p%40ssword@host/db
```

**特殊字符编码表**：
| 字符 | URL 编码 |
|------|----------|
| @ | %40 |
| : | %3A |
| / | %2F |
| # | %23 |
| ? | %3F |
| & | %26 |

---

## ✅ 验证步骤

### 1. 检查环境变量格式

在 Vercel Environment Variables 页面，确认：

```
✅ DATABASE_URL
   Type: Plain Text
   Environments: Production, Preview, Development
   Value: postgresql://... (显示部分隐藏)

❌ DATABASE_URL
   Type: Secret Reference
   Value: @database_url
```

### 2. 测试数据库连接

部署完成后，访问你的应用：

```
https://your-app.vercel.app
```

打开浏览器控制台（F12），查看是否有数据库连接错误。

### 3. 查看构建日志

在 Vercel Deployments 页面：
1. 点击最新部署
2. 查看 **Build Logs**
3. 搜索 "DATABASE_URL" 或 "Prisma"
4. 确认没有连接错误

---

## 🎯 预期成功输出

构建日志中应该看到：

```
✓ Prisma schema loaded from prisma/schema.prisma
✓ Datasource "db": PostgreSQL database "neondb"
✓ Generated Prisma Client
✓ Compiled successfully
```

应用运行时：
```
✓ Database connected
✓ Prisma Client initialized
✓ Server running on https://your-app.vercel.app
```

---

## 🆘 仍然失败？

### 检查清单：

- [ ] Neon 数据库是否处于 **Active** 状态？
- [ ] 连接字符串是否包含 `?sslmode=require`？
- [ ] 用户名和密码是否正确（特殊字符已编码）？
- [ ] 环境变量是否选择了 **Production** 环境？
- [ ] 是否已经 **Redeploy** 项目？
- [ ] `.env.local` 文件是否已添加到 `.gitignore`？

### 获取 Neon 连接字符串：

1. 访问 [console.neon.tech](https://console.neon.tech)
2. 选择你的项目
3. 在 Dashboard 复制 **Connection String**
4. 格式：`postgresql://[user]:[password]@[host]/[database]?sslmode=require`

---

## 📚 相关文档

- [Vercel 环境变量文档](https://vercel.com/docs/projects/environment-variables)
- [Neon 连接指南](https://neon.tech/docs/connect/connect-from-any-app)
- [Prisma + Vercel 部署](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

**✨ 修复完成后，你的应用应该能正常连接 Neon 数据库了！**
