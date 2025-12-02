# 📜 License Type 许可证类型详解

## 概述

CreatorBridge 提供三种许可证类型，基于 **Story Protocol** 的 **PIL (Programmable IP License)** 可编程知识产权许可证标准。每种许可证类型有不同的商业使用权限和衍生作品规则。

---

## 一、三种许可证类型对比

| 许可证类型 | 英文名称 | 主题颜色 | 免费使用 | 商业使用 | 衍生作品 | 收益分成 |
|-----------|---------|---------|---------|---------|---------|---------|
| **非商业** | Non-Commercial | 🟢 绿色 | ✅ 是 | ❌ 否 | ✅ 是 | ❌ 无 |
| **商业使用** | Commercial Use | 🔵 蓝色 | ❌ 否 | ✅ 是 | ❌ 否 | ❌ 无 |
| **商业混音** | Commercial Remix | 🟣 紫色 | ❌ 否 | ✅ 是 | ✅ 是 | ✅ 有 |

---

## 二、详细说明

### 1️⃣ Non-Commercial（非商业许可证）

#### **适用场景**
```
✅ 教育项目
✅ 个人学习
✅ 非盈利组织
✅ 开源社区
✅ 学术研究
```

#### **权限说明**

**✅ 可以做：**
- 免费获取许可证（Minting Fee = 0）
- 用于非商业目的（学习、研究、展示）
- 创建衍生作品（Remix、改编、二创）
- 必须注明原作者（Attribution）

**❌ 不可以做：**
- 用于商业盈利（销售、广告、付费服务）
- 不支付费用进行商业使用
- 声称作品为自己原创

---

#### **代码定义**

```typescript
// lib/types/license.ts
export enum LicenseType {
  NON_COMMERCIAL = 'NON_COMMERCIAL',
  // ...
}

export const LICENSE_TYPE_INFO = {
  [LicenseType.NON_COMMERCIAL]: {
    label: 'Non-Commercial',
    description: 'Free to use for non-commercial purposes. Derivatives allowed with attribution.',
    color: 'emerald'  // 绿色主题
  }
};
```

---

#### **用户界面展示**

```
┌─────────────────────────────────────┐
│ 💎 Non-Commercial License           │  ← 绿色标签
├─────────────────────────────────────┤
│ ✅ Free to use                      │
│ ❌ Commercial use not permitted     │
│ ✅ Derivatives allowed              │
│                                     │
│ Price: FREE                         │  ← 免费
└─────────────────────────────────────┘
```

---

#### **实际案例**

```
例子 1：学生项目
一位设计学生看到你的 AI 插画，想在课程作业中使用。
✅ 可以免费获取许可证
✅ 可以在作业中使用
✅ 需要注明你是原作者

例子 2：开源项目
一个非盈利开源项目想使用你的图标。
✅ 可以免费使用
✅ 可以修改和改编
❌ 不能用于付费产品
```

---

### 2️⃣ Commercial Use（商业使用许可证）

#### **适用场景**
```
✅ 企业产品
✅ 付费服务
✅ 商业广告
✅ 品牌推广
❌ 不允许创建衍生作品
```

#### **权限说明**

**✅ 可以做：**
- 支付一次性费用（Minting Fee）获取许可证
- 用于商业盈利项目（产品、服务、广告）
- 无需额外支付版税（一次性买断）

**❌ 不可以做：**
- 创建衍生作品（不允许 Remix）
- 修改原作品后再销售
- 免费获取商业使用权限

---

#### **代码定义**

```typescript
export const LICENSE_TYPE_INFO = {
  [LicenseType.COMMERCIAL_USE]: {
    label: 'Commercial Use',
    description: 'Licensed for commercial use. Pay minting fee to obtain license.',
    color: 'blue'  // 蓝色主题
  }
};
```

---

#### **用户界面展示**

```
┌─────────────────────────────────────┐
│ 💎 Commercial Use License           │  ← 蓝色标签
├─────────────────────────────────────┤
│ ✅ Commercial use permitted         │
│ ❌ Derivatives not permitted        │
│ 💰 One-time payment                 │
│                                     │
│ Price: 0.1 WIP                      │  ← 需要支付
└─────────────────────────────────────┘
```

---

#### **定价配置**

在 Create 页面设置：

```tsx
// 创建者设置铸造费用
Minting Fee: 0.1 WIP  // 购买者需支付的一次性费用
```

**定价建议：**
- 🎨 插画/图标：0.05 - 0.2 WIP
- 📸 摄影作品：0.1 - 0.5 WIP
- 🎵 音乐片段：0.2 - 1.0 WIP
- 📹 视频素材：0.5 - 2.0 WIP

---

#### **实际案例**

```
例子 1：企业网站
一家公司看到你的插画，想用在官网上。
✅ 支付 0.1 WIP 获取许可证
✅ 可以用于商业网站
❌ 不能修改后制作周边产品
❌ 不能创建衍生作品

例子 2：游戏开发
一个独立游戏想使用你的背景音乐。
✅ 支付一次性费用
✅ 可以在付费游戏中使用
❌ 不能改编成新曲目
```

---

### 3️⃣ Commercial Remix（商业混音许可证）

#### **适用场景**
```
✅ 内容创作者（YouTuber、博主）
✅ 设计师二创
✅ 游戏 Mod 制作
✅ 音乐混音
✅ 艺术再创作
✅ 需要收益分成的商业合作
```

#### **权限说明**

**✅ 可以做：**
- 支付铸造费用获取许可证
- 用于商业盈利项目
- **创建衍生作品（Derivatives）**
- 将衍生作品商业化销售
- 自动收益分成（Revenue Share）

**❌ 不可以做：**
- 免费商业使用
- 不注明原作者
- 不支付收益分成

---

#### **代码定义**

```typescript
export const LICENSE_TYPE_INFO = {
  [LicenseType.COMMERCIAL_REMIX]: {
    label: 'Commercial Remix',
    description: 'Commercial use with derivatives allowed. Revenue share applies to derivative works.',
    color: 'purple'  // 紫色主题
  }
};
```

---

#### **用户界面展示**

```
┌─────────────────────────────────────┐
│ 💎 Commercial Remix License         │  ← 紫色标签
├─────────────────────────────────────┤
│ ✅ Commercial use permitted         │
│ ✅ Derivatives allowed              │
│ 💰 Revenue share: 10%               │  ← 收益分成
│                                     │
│ Price: 0.1 WIP                      │  ← 需要支付
│ + 10% revenue share                 │  ← 额外分成
└─────────────────────────────────────┘
```

---

#### **收益分成机制**

**创建者设置：**
```tsx
Minting Fee: 0.1 WIP            // 初始购买费用
Commercial Rev Share: 10%        // 衍生作品收益分成比例
```

**工作流程：**

```
1. Alice 创建原作 IP-A
   └─ License: Commercial Remix
   └─ Minting Fee: 0.1 WIP
   └─ Rev Share: 10%

2. Bob 购买许可证
   └─ 支付: 0.1 WIP → Alice

3. Bob 创建衍生作品 IP-B
   └─ 基于: IP-A
   └─ License: Commercial Remix
   └─ Minting Fee: 0.2 WIP
   └─ Rev Share: 15%

4. Carol 购买 IP-B 许可证
   └─ 支付: 0.2 WIP
   └─ 分配:
      - Bob 获得: 0.18 WIP (90%)
      - Alice 获得: 0.02 WIP (10%)  ← 自动分成
```

**链上自动执行：**
- ✅ Story Protocol 智能合约自动计算分成
- ✅ 收益实时分配到钱包
- ✅ 无需手动操作
- ✅ 完全透明可追溯

---

#### **实际案例**

```
例子 1：音乐混音
一位 DJ 看到你的原创音乐，想制作混音版本销售。
✅ 支付 0.1 WIP 获取许可证
✅ 创建混音版本（衍生作品）
✅ 在音乐平台销售混音版
✅ 每卖出一份，你自动获得 10% 收益

例子 2：游戏 Mod
一位游戏开发者想基于你的 3D 模型创建 Mod。
✅ 支付铸造费用
✅ 创建 Mod（衍生作品）
✅ 在 Steam 销售 Mod
✅ 每笔销售自动分成给你

例子 3：设计师二创
一位设计师看到你的插画风格，想创作系列作品。
✅ 获取 Commercial Remix 许可
✅ 创作新的插画（衍生作品）
✅ 制作周边产品销售
✅ 你持续获得收益分成
```

---

## 三、创建时的选择建议

### 🎯 **选择 Non-Commercial 如果：**
- 你想推广作品，扩大影响力
- 你愿意让学生和非盈利组织免费使用
- 你希望建立创作者社区
- 你不在乎商业收益

**优点：**
- ✅ 传播速度快
- ✅ 更多人使用
- ✅ 建立知名度

**缺点：**
- ❌ 无直接收益
- ❌ 商业价值受限

---

### 🎯 **选择 Commercial Use 如果：**
- 你想一次性卖断作品使用权
- 你不希望别人修改你的作品
- 你想保护作品完整性
- 你提供的是完成品（如摄影、成品设计）

**优点：**
- ✅ 一次性收益明确
- ✅ 作品不被改编
- ✅ 适合完成品销售

**缺点：**
- ❌ 无持续收益
- ❌ 限制创意扩展
- ❌ 衍生价值流失

---

### 🎯 **选择 Commercial Remix 如果：**
- 你想建立持续收益流
- 你鼓励基于你的作品进行创作
- 你想从衍生作品中持续获利
- 你提供的是创意素材（如风格、元素）

**优点：**
- ✅ 持续被动收入
- ✅ 创作生态扩展
- ✅ 长期价值增长
- ✅ 激励更多创作

**缺点：**
- ⚠️ 需要管理衍生作品
- ⚠️ 收益分成可能复杂

---

## 四、前端创建界面

### Create 页面配置

```
┌─────────────────────────────────────────────┐
│ License Type                                │
├─────────────────────────────────────────────┤
│                                             │
│ ○ 💎 Non-Commercial                         │  ← 绿色
│   Free to use for non-commercial purposes   │
│   Derivatives allowed with attribution      │
│                                             │
│ ○ 💎 Commercial Use                         │  ← 蓝色
│   Licensed for commercial use               │
│   Pay minting fee to obtain license         │
│                                             │
│ ● 💎 Commercial Remix                       │  ← 紫色（已选中）
│   Commercial use with derivatives allowed   │
│   Revenue share applies to derivatives      │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Pricing Configuration                       │
├─────────────────────────────────────────────┤
│                                             │
│ Minting Fee                                 │
│ ┌─────────────────────────────────────────┐ │
│ │ 0.1                                  WIP│ │
│ └─────────────────────────────────────────┘ │
│ One-time fee for license purchase          │
│                                             │
│ Commercial Revenue Share                    │
│ ┌─────────────────────────────────────────┐ │
│ │ 10                                     %│ │
│ └─────────────────────────────────────────┘ │
│ Percentage of derivative work revenue      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 五、许可证类型在代码中的使用

### 5.1 枚举定义

```typescript
// lib/types/license.ts

export enum LicenseType {
  NON_COMMERCIAL = 'NON_COMMERCIAL',
  COMMERCIAL_USE = 'COMMERCIAL_USE',
  COMMERCIAL_REMIX = 'COMMERCIAL_REMIX'
}
```

---

### 5.2 License 配置

```typescript
export interface LicenseConfig {
  type: LicenseType;
  mintingFee?: string;        // 仅 COMMERCIAL_USE 和 COMMERCIAL_REMIX 需要
  commercialRevShare?: number; // 仅 COMMERCIAL_REMIX 需要
}
```

---

### 5.3 创建 IP 时的参数

```typescript
// app/create/page.tsx

const handleSubmit = async () => {
  await registerIP(
    title, 
    description, 
    parseFloat(getDisplayPrice()), 
    preview,
    licenseType,  // 许可证类型
    licenseType !== LicenseType.NON_COMMERCIAL ? mintingFee : undefined,  // 铸造费用
    licenseType === LicenseType.COMMERCIAL_REMIX ? commercialRevShare : undefined  // 收益分成
  );
};
```

---

### 5.4 衍生作品验证

```typescript
// lib/derivative-utils.ts

export function licenseAllowsDerivatives(licenseType: LicenseType | null): boolean {
  if (!licenseType) return false;
  
  return licenseType === LicenseType.NON_COMMERCIAL || 
         licenseType === LicenseType.COMMERCIAL_REMIX;
}
```

**验证逻辑：**
- ✅ `NON_COMMERCIAL` → 允许衍生作品
- ❌ `COMMERCIAL_USE` → 不允许衍生作品
- ✅ `COMMERCIAL_REMIX` → 允许衍生作品

---

## 六、UI 颜色主题

| 许可证类型 | 主题颜色 | CSS 类名 | Hex 颜色 |
|-----------|---------|---------|---------|
| Non-Commercial | 🟢 绿色 | `emerald` | `#10b981` |
| Commercial Use | 🔵 蓝色 | `blue` | `#3b82f6` |
| Commercial Remix | 🟣 紫色 | `purple` | `#a855f7` |

---

## 七、常见问题 FAQ

### Q1: 可以中途更改许可证类型吗？
A: 目前不支持。许可证类型在 IP 注册时确定，之后无法修改。建议创建前仔细考虑。

---

### Q2: Commercial Remix 的收益分成如何计算？
A: Story Protocol 智能合约自动计算。例如设置 10% 分成：
- 衍生作品售价 0.2 WIP
- 原作者自动收到 0.02 WIP
- 衍生作者收到 0.18 WIP

---

### Q3: Non-Commercial 许可证完全免费吗？
A: 是的，获取许可证无需支付任何费用（Minting Fee = 0）。

---

### Q4: 如果有人违反许可证条款怎么办？
A: Story Protocol 通过智能合约强制执行：
- 链上注册确保所有权
- 自动分配收益
- 透明可追溯

---

### Q5: 可以同时使用多种许可证吗？
A: 不可以。每个 IP 资产只能选择一种许可证类型。

---

## 八、最佳实践

### 📌 **创作者建议**

| 作品类型 | 推荐许可证 | 原因 |
|---------|-----------|------|
| 教育内容 | Non-Commercial | 扩大影响力 |
| 摄影作品 | Commercial Use | 保护完整性 |
| 音乐素材 | Commercial Remix | 持续收益 |
| 设计模板 | Commercial Remix | 鼓励二创 |
| 成品插画 | Commercial Use | 一次性买断 |

---

### 📌 **购买者建议**

**购买前确认：**
1. ✅ 是否允许商业使用？
2. ✅ 是否允许创建衍生作品？
3. ✅ 是否需要支付持续分成？
4. ✅ 许可证费用是否合理？

---

## 九、总结

### 🎯 **三种许可证快速对比**

```
Non-Commercial (免费开放)
├─ 免费使用 ✅
├─ 非商业用途 ✅
├─ 允许衍生 ✅
└─ 无收益分成 ❌

Commercial Use (一次性买断)
├─ 需要付费 💰
├─ 商业用途 ✅
├─ 不允许衍生 ❌
└─ 无收益分成 ❌

Commercial Remix (持续分成)
├─ 需要付费 💰
├─ 商业用途 ✅
├─ 允许衍生 ✅
└─ 有收益分成 💸
```

---

**选择建议：**
- 🆓 想推广作品 → **Non-Commercial**
- 💼 想卖断作品 → **Commercial Use**
- 💰 想长期收益 → **Commercial Remix**

---

完整技术文档：`lib/types/license.ts`
