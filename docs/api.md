# NQuest Studio 后端 API 文档

> 面向前端开发者的接口对接文档。所有 JSON 字段名使用 **camelCase**。

---

## 一、全局约定

### Base URL

```
/api/v1
```

### 认证方式

| 场景 | 方式 | Header |
|------|------|--------|
| Webapp 用户请求 | JWT Bearer Token | `Authorization: Bearer <token>` |
| MC 服务器同步 | 静态 API Key | `X-API-Key: <key>` |

大部分端点支持**可选认证**（未登录只能看到 PUBLIC 内容），部分端点**要求认证**（返回 401）。

### 统一错误格式

所有 4xx/5xx 响应体：

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

**错误码一览：**

| HTTP | error | 说明 |
|------|-------|------|
| 400 | `INVALID_REQUEST` | 请求参数不合法 |
| 400 | `INVALID_QUEST_ID` | Quest ID 格式不合法 |
| 400 | `INVALID_CATEGORY_ID` | Category ID 格式不合法 |
| 400 | `INVALID_ACL` | ACL 校验失败（附带具体原因） |
| 401 | `UNAUTHORIZED` | 未提供或无效的认证凭据 |
| 403 | `FORBIDDEN` | 无权限执行此操作 |
| 404 | `QUEST_NOT_FOUND` | Quest 不存在，或当前用户无查看权限 |
| 404 | `CATEGORY_NOT_FOUND` | Category 不存在 |
| 409 | `QUEST_ID_ALREADY_EXISTS` | Quest ID 已被占用 |
| 409 | `CATEGORY_ID_ALREADY_EXISTS` | Category ID 已被占用 |
| 409 | `STATUS_CONFLICT` | 目标状态与当前状态相同，或不满足条件 |
| 409 | `NO_PENDING_DRAFT` | Quest 没有待审批的草稿变更 |
| 500 | `INTERNAL_ERROR` | 服务器内部错误 |

### 时间戳

所有时间字段均为 **epoch milliseconds**（`number`，如 `1708000000000`）。

---

## 二、核心概念

### 2.1 用户角色

通过 Discord OAuth2 登录后，根据用户在 Discord Guild 中的 Role 自动映射：

| App 角色 | 来源 | 权限范围 |
|---------|------|---------|
| `ADMIN` | 拥有 Admin Discord Role（可配置多个） | 全部操作 + 发布审批 |
| `AUTHOR` | 拥有 Author Discord Role（可配置多个） | 创建 Quest、编辑自己参与的 Quest |

**ADMIN 隐含 AUTHOR 权限。**

### 2.2 Quest 状态（三态模型）

| 状态 | 含义 | 同步到 MC 服务器 |
|------|------|----------------|
| `PRIVATE` | Webapp 端仅 ACL 成员可见，MC 端仅 creators 可参与 | 是（PRIVATE 标识） |
| `STAGING` | Webapp 端仅 ACL 成员可见，MC 端所有 builder 可见（用于测试/预览） | 是（STAGING 标识） |
| `PUBLIC` | 所有人可见 | 是（PUBLIC 标识） |

**三种状态均会同步到 MC 服务器**，MC 端根据 status 和 creators 进行可见性过滤。

**新建 Quest 默认为 PRIVATE。**

**状态切换权限：**

```
PRIVATE ←→ STAGING  : Quest Owner 或 Admin
PRIVATE → PUBLIC    : Admin only
STAGING → PUBLIC    : Admin only
PUBLIC  → PRIVATE   : Quest Owner 或 Admin
PUBLIC  → STAGING   : Quest Owner 或 Admin
```

### 2.3 双版本模型（data_draft / data_public）

Quest 数据分为两层：

- **元数据**（name, description, category, tier, questPoints）：Author 修改后**立即生效**
- **游戏逻辑**（steps, defaultCriteria）：存储在 `dataDraft` / `dataPublic` 两个 JSON 中

**工作流程：**

1. 编辑 Quest 时，所有改动都写入 `dataDraft`
2. 如果 Quest 当前是 PUBLIC 状态：
   - 元数据（name 等）的修改立即反映到线上版本
   - 游戏逻辑（steps 等）的修改只写入 `dataDraft`，线上版本（`dataPublic`）不受影响
   - 当 `dataDraft` 的游戏逻辑与 `dataPublic` 不同时，`hasPendingDraft` 变为 `true`
3. Admin 调用 **promote** 端点审批后，`dataPublic` 更新为 `dataDraft` 内容，`hasPendingDraft` 变为 `false`

**前端在编辑器中应始终读写 `dataDraft`。** `dataPublic` 仅在 Quest 处于 PUBLIC 且有历史发布数据时存在，可用于展示"当前线上版"与"编辑中草稿"的对比。

### 2.4 Quest ACL

每个 Quest 有一个访问控制列表（ACL），成员角色为：

| ACL 角色 | 权限 |
|---------|------|
| `OWNER` | 编辑内容 + 修改状态 + 管理 ACL + 删除 Quest |
| `EDITOR` | 仅编辑内容 |

创建 Quest 时，创建者自动成为 OWNER。

### 2.5 Quest ID 规则

- 1~64 个字符
- 仅允许 `[a-z0-9_-]`
- **不允许包含 `__`**（双下划线，系统内部保留）

### 2.6 Category ID 规则

- 1~64 个字符
- 仅允许 `[a-z0-9_-]`

---

## 三、认证端点

### 3.1 `GET /api/v1/auth/discord`

发起 Discord OAuth2 登录流程。

- **认证**：无
- **Query 参数**：`redirect`（可选）— 授权完成后前端跳转地址
- **响应**：`302` 重定向到 Discord 授权页

### 3.2 `GET /api/v1/auth/discord/callback`

Discord OAuth2 回调。用户授权后 Discord 会重定向到此端点。

- **认证**：无
- **Query 参数**：`code`、`state`（由 Discord 填充）
- **响应**：`200`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

前端拿到 `token` 后存储（localStorage / cookie），后续请求通过 `Authorization: Bearer <token>` 携带。

### 3.3 `GET /api/v1/auth/me`

获取当前登录用户信息。

- **认证**：Bearer JWT（必须）
- **响应**：`200`

```json
{
  "discordUserId": "123456789",
  "username": "PlayerOne",
  "roles": ["ADMIN", "AUTHOR"],
  "mcUuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `discordUserId` | `string` | Discord 用户 ID |
| `username` | `string` | Discord 显示名 |
| `roles` | `string[]` | 应用角色（`"ADMIN"` / `"AUTHOR"`） |
| `mcUuid` | `string \| null` | 已绑定的 Minecraft UUID，未绑定为 `null` |

### 3.4 `POST /api/v1/auth/bind-mc`

绑定 Minecraft UUID。用户需先从 MC 服务器获取一个由服务器签发的 JWT。

- **认证**：Bearer JWT（必须）
- **请求**：

```json
{
  "token": "<mc-server-signed-jwt>"
}
```

该 JWT 的 `sub` claim 即为玩家的 Minecraft UUID。

- **成功响应**：`200`

```json
{
  "mcUuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

- **错误**：`400 INVALID_REQUEST` — token 无效或 UUID 格式错误

### 3.5 `DELETE /api/v1/auth/bind-mc`

解除 Minecraft UUID 绑定。

- **认证**：Bearer JWT（必须）
- **响应**：`204 No Content`

---

## 四、Quest 端点

### 4.1 `GET /api/v1/quests`

列出 Quest（分页）。

- **认证**：可选
- **Query 参数**：

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `status` | `string` | 不过滤 | `PRIVATE` / `STAGING` / `PUBLIC` |
| `category` | `string` | 不过滤 | Category ID |
| `page` | `number` | 1 | 页码（从 1 开始） |
| `size` | `number` | 20 | 每页数量（1-100） |

- **可见性规则**：

| 用户身份 | 可见范围 |
|---------|---------|
| 未登录 | 仅 PUBLIC |
| AUTHOR | 所有 PUBLIC + 自己在 ACL 中的 PRIVATE/STAGING |
| ADMIN | 全部 |

- **响应**：`200`

```json
{
  "items": [
    {
      "id": "mtr-central-line",
      "status": "PUBLIC",
      "name": "Central Line Tour",
      "description": "Visit all stations on the Central Line",
      "category": "mtr-lines",
      "tier": "easy",
      "questPoints": 10,
      "hasPendingDraft": true,
      "createdBy": {
        "discordUserId": "123",
        "username": "Author1"
      },
      "lastModifiedAt": 1708000000000,
      "acl": [
        { "discordUserId": "123", "discordUsername": "Author1", "role": "OWNER" },
        { "discordUserId": "456", "discordUsername": "Editor1", "role": "EDITOR" }
      ]
    }
  ],
  "total": 42,
  "page": 1,
  "size": 20
}
```

> 列表项**不包含** `dataDraft` / `dataPublic`（内容详情需通过详情接口获取）。

### 4.2 `GET /api/v1/quests/:id`

获取 Quest 完整详情。

- **认证**：可选
- **权限**：PUBLIC Quest 任何人可查看；PRIVATE/STAGING 需为 ADMIN 或 ACL 成员。不满足权限时返回 404（不暴露存在性）。
- **响应**：`200`

```json
{
  "id": "mtr-central-line",
  "status": "PUBLIC",
  "name": "Central Line Tour",
  "description": "Visit all stations on the Central Line",
  "category": "mtr-lines",
  "tier": "easy",
  "questPoints": 10,
  "dataDraft": {
    "steps": [
      {
        "criteria": { "type": "VisitStationCriterion", "stationName": "Central" },
        "failureCriteria": null
      }
    ],
    "defaultCriteria": null
  },
  "dataPublic": {
    "steps": [ ... ],
    "defaultCriteria": null
  },
  "hasPendingDraft": true,
  "createdBy": {
    "discordUserId": "123",
    "username": "Author1"
  },
  "createdAt": 1708000000000,
  "lastModifiedBy": {
    "discordUserId": "456",
    "username": "Editor1"
  },
  "lastModifiedAt": 1708001000000,
  "acl": [
    { "discordUserId": "123", "discordUsername": "Author1", "role": "OWNER" }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `dataDraft` | `QuestData` | 最新编辑版游戏逻辑，**前端编辑器应读写此字段** |
| `dataPublic` | `QuestData \| undefined` | 当前线上版游戏逻辑（仅 PUBLIC 且有发布历史时存在） |
| `hasPendingDraft` | `boolean` | 是否有待 Admin 审批的游戏逻辑变更 |

**`QuestData` 结构：**

```typescript
interface QuestData {
  steps: Step[];
  defaultCriteria: Criterion | null;
}

interface Step {
  criteria: Criterion;         // 完成条件（多态 JSON，由 type 字段区分）
  failureCriteria?: Criterion; // 失败条件（可选）
}
```

Criterion 为不透明多态 JSON，后端不校验其内部结构，原样存取。

### 4.3 `POST /api/v1/quests`

创建新 Quest。

- **认证**：Bearer JWT（必须）
- **权限**：AUTHOR 或 ADMIN
- **请求**：

```json
{
  "id": "my-quest-slug",
  "name": "My Quest",
  "description": "A fun quest",
  "category": "mtr-lines",
  "tier": "easy",
  "questPoints": 10,
  "steps": [
    {
      "criteria": { "type": "VisitStationCriterion", "stationName": "Central" },
      "failureCriteria": null
    }
  ],
  "defaultCriteria": null
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 自定义 slug，需符合 ID 规则 |
| `name` | `string` | 是 | 显示名 |
| `description` | `string` | 否 | 描述 |
| `category` | `string` | 否 | Category ID（如提供须存在） |
| `tier` | `string` | 否 | 难度等级 slug |
| `questPoints` | `number` | 否 | 积分，默认 0 |
| `steps` | `Step[]` | 否 | 步骤列表，默认 `[]` |
| `defaultCriteria` | `Criterion` | 否 | 全局默认条件，默认 `null` |

- **行为**：
  - 新 Quest 状态固定为 **PRIVATE**
  - 自动创建 ACL 条目，创建者为 OWNER
- **成功响应**：`201 Created` + 完整 Quest 对象
- **错误**：`400 INVALID_QUEST_ID` / `404 CATEGORY_NOT_FOUND` / `409 QUEST_ID_ALREADY_EXISTS`

### 4.4 `PUT /api/v1/quests/:id`

编辑 Quest 内容。

- **认证**：Bearer JWT（必须）
- **权限**：ADMIN、或 Quest ACL 中的 OWNER / EDITOR
- **请求**：

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "category": "mtr-lines",
  "tier": "hard",
  "questPoints": 20,
  "steps": [ ... ],
  "defaultCriteria": null
}
```

所有字段同创建（除 `id` 不可修改）。

- **行为**：
  - 元数据（name, description, category, tier, questPoints）**立即更新**
  - 游戏逻辑（steps, defaultCriteria）写入 `dataDraft`
  - 若 Quest 为 PUBLIC 状态，后端自动比较新的 `dataDraft` 与 `dataPublic`：
    - 不同 → `hasPendingDraft = true`（前端可据此展示"有待审批变更"提示）
    - 相同 → `hasPendingDraft = false`
- **成功响应**：`200` + 完整 Quest 对象
- **错误**：`403 FORBIDDEN` / `404 QUEST_NOT_FOUND` / `404 CATEGORY_NOT_FOUND`

### 4.5 `DELETE /api/v1/quests/:id`

删除 Quest。

- **认证**：Bearer JWT（必须）
- **权限**：ADMIN 或 Quest ACL 中的 OWNER
- **响应**：`204 No Content`
- **错误**：`403 FORBIDDEN` / `404 QUEST_NOT_FOUND`

### 4.6 `PUT /api/v1/quests/:id/status`

修改 Quest 状态。

- **认证**：Bearer JWT（必须）
- **请求**：

```json
{
  "status": "PUBLIC"
}
```

`status` 取值：`"PUBLIC"` / `"PRIVATE"` / `"STAGING"`

- **权限**：

| 目标状态 | 所需权限 |
|---------|---------|
| `PUBLIC` | ADMIN only |
| `PRIVATE` | Quest Owner 或 ADMIN |
| `STAGING` | Quest Owner 或 ADMIN |

- **行为**：

| 状态切换 | 副作用 |
|---------|--------|
| 任意 → `PUBLIC` | `dataPublic = dataDraft`，`hasPendingDraft = false` |
| `PUBLIC` → 其他 | `dataPublic` 保留（不清空），`hasPendingDraft = false` |
| 其他 → 其他 | 无额外副作用 |

- **成功响应**：`200` + 完整 Quest 对象（状态已更新）
- **错误**：`400 INVALID_REQUEST`（无效 status 值） / `403 FORBIDDEN` / `404 QUEST_NOT_FOUND` / `409 STATUS_CONFLICT`（目标状态与当前相同）

### 4.7 `POST /api/v1/quests/:id/promote`

Admin 审批草稿变更，将 `dataDraft` 的游戏逻辑推送到线上版本。

- **认证**：Bearer JWT（必须）
- **权限**：ADMIN only
- **前提条件**：Quest 当前为 `PUBLIC` 状态，且 `hasPendingDraft == true`
- **行为**：`dataPublic = dataDraft`，`hasPendingDraft = false`
- **请求**：无 body
- **成功响应**：`200` + 完整 Quest 对象
- **错误**：`403 FORBIDDEN` / `404 QUEST_NOT_FOUND` / `409 STATUS_CONFLICT`（Quest 非 PUBLIC） / `409 NO_PENDING_DRAFT`

---

## 五、ACL 端点

### 5.1 `GET /api/v1/quests/:id/acl`

获取 Quest 的 ACL 列表。

- **认证**：Bearer JWT（必须）
- **权限**：ADMIN 或 Quest ACL 中的 OWNER
- **响应**：`200`

```json
[
  { "discordUserId": "123", "discordUsername": "Author1", "role": "OWNER" },
  { "discordUserId": "456", "discordUsername": null, "role": "EDITOR" }
]
```

### 5.2 `PUT /api/v1/quests/:id/acl`

整体替换 Quest 的 ACL。

- **认证**：Bearer JWT（必须）
- **权限**：ADMIN 或 Quest ACL 中的 OWNER
- **请求**：

```json
[
  { "discordUserId": "123", "role": "OWNER" },
  { "discordUserId": "456", "role": "EDITOR" }
]
```

- **校验规则**：
  1. 不能为空
  2. 至少包含一个 `OWNER`
  3. `role` 只能是 `"OWNER"` 或 `"EDITOR"`
  4. 不允许重复的 `discordUserId`
  5. 非 ADMIN 用户不能将自己从 ACL 中移除
  6. 非 ADMIN 用户不能将自己从 OWNER 降级为 EDITOR

- **成功响应**：`200` + 更新后的 ACL 数组
- **错误**：`400 INVALID_ACL`（附带具体原因，如 `"Must have at least one OWNER"`）/ `403 FORBIDDEN` / `404 QUEST_NOT_FOUND`

---

## 六、Category 端点

### 6.1 `GET /api/v1/categories`

列出所有 Category。

- **认证**：无需
- **响应**：`200`

```json
{
  "mtr-lines": {
    "name": "MTR Lines",
    "description": "Quests about MTR lines",
    "icon": "minecraft:rail",
    "order": 0,
    "tiers": {
      "easy": { "name": "Easy", "icon": "minecraft:gold_nugget", "order": 0 },
      "hard": { "name": "Hard", "icon": "minecraft:gold_ingot", "order": 1 }
    }
  }
}
```

返回格式为 Map：key 是 Category ID，value 是 Category 对象。

**`QuestCategory` 结构：**

```typescript
interface QuestCategory {
  name: string;
  description: string;
  icon: string;            // Minecraft ResourceLocation，如 "minecraft:book"
  order: number;
  tiers: Record<string, QuestTier>;
}

interface QuestTier {
  name: string;
  icon: string;
  order: number;
}
```

### 6.2 `POST /api/v1/categories`

创建新 Category。

- **认证**：Bearer JWT（必须）
- **权限**：ADMIN only
- **请求**：

```json
{
  "id": "mtr-lines",
  "name": "MTR Lines",
  "description": "Quests about MTR lines",
  "icon": "minecraft:rail",
  "order": 0,
  "tiers": {
    "easy": { "name": "Easy", "icon": "minecraft:gold_nugget", "order": 0 }
  }
}
```

- **成功响应**：`201 Created` + Category 对象（不含 id）
- **错误**：`400 INVALID_CATEGORY_ID` / `409 CATEGORY_ID_ALREADY_EXISTS`

### 6.3 `PUT /api/v1/categories/:id`

更新 Category。

- **认证**：Bearer JWT（必须）
- **权限**：ADMIN only
- **请求**：Category 对象（不含 id）

```json
{
  "name": "MTR Lines",
  "description": "Updated description",
  "icon": "minecraft:rail",
  "order": 0,
  "tiers": { ... }
}
```

- **成功响应**：`200` + 更新后的 Category 对象
- **错误**：`404 CATEGORY_NOT_FOUND`

### 6.4 `DELETE /api/v1/categories/:id`

删除 Category。引用该 Category 的 Quest 的 `category` 字段会自动变为 `null`。

- **认证**：Bearer JWT（必须）
- **权限**：ADMIN only
- **响应**：`204 No Content`
- **错误**：`404 CATEGORY_NOT_FOUND`

---

## 七、同步端点（MC 服务器专用）

认证方式为 `X-API-Key` header，非 JWT。

### 7.1 `GET /api/v1/sync/status`

检查是否有新数据。MC 服务器轮询此端点，比较 `lastModified` 判断是否需要拉取 bundle。

- **认证**：`X-API-Key`
- **响应**：`200`

```json
{
  "lastModified": 1708000000000
}
```

### 7.2 `GET /api/v1/sync/bundle`

获取完整数据包。

- **认证**：`X-API-Key`
- **响应**：`200`

```json
{
  "lastModified": 1708000000000,
  "quests": {
    "mtr-central-line": {
      "id": "mtr-central-line",
      "name": "Central Line Tour",
      "description": "Visit all stations on the Central Line",
      "category": "mtr-lines",
      "tier": "easy",
      "questPoints": 10,
      "status": "PUBLIC",
      "steps": [ ... ],
      "defaultCriteria": null,
      "creators": ["550e8400-e29b-41d4-a716-446655440000"]
    },
    "mtr-central-line__draft": {
      "id": "mtr-central-line__draft",
      "name": "Central Line Tour",
      "description": "Visit all stations on the Central Line",
      "category": "mtr-lines",
      "tier": "easy",
      "questPoints": 10,
      "status": "PRIVATE",
      "steps": [ ... ],
      "defaultCriteria": null,
      "creators": ["550e8400-e29b-41d4-a716-446655440000"]
    }
  },
  "categories": { ... }
}
```

**Bundle 内容组成：**

| 来源 | bundle 中的 status | 数据来源 |
|------|-------------------|---------|
| `PUBLIC` Quest | `PUBLIC` | 元数据列 + `dataPublic` |
| `PRIVATE` Quest | `PRIVATE` | 元数据列 + `dataDraft` |
| `STAGING` Quest | `STAGING` | 元数据列 + `dataDraft` |
| `PUBLIC` Quest 的待审批草稿 | `STAGING`（派生） | 元数据列 + `dataDraft`，ID 后缀 `__draft` |

- **所有状态的 Quest 均包含在 bundle 中。**
- 每个 Quest 携带 `creators` 字段：该 Quest ACL 成员中已绑定 MC UUID 的 UUID 列表。
- MC 服务器根据 `status` 和 `creators` 进行可见性过滤：
  - `PUBLIC` → 所有玩家可见
  - `STAGING` → 所有 builder 可见
  - `PRIVATE` → 仅 `creators` 中的玩家可见

---

## 八、前端 UX 交互指引

### 8.1 登录流程

```
1. 前端引导用户访问 GET /api/v1/auth/discord
2. 用户在 Discord 授权页面同意
3. 重定向到 callback，前端拿到 { token }
4. 存储 token，后续请求 Header 带 Authorization: Bearer <token>
5. 调用 GET /api/v1/auth/me 获取用户信息和角色
```

### 8.2 Quest 编辑器

**加载 Quest：**
- 调用 `GET /quests/:id` 获取完整数据
- 编辑器应读取 `dataDraft`（steps, defaultCriteria）作为编辑内容
- 元数据（name, description, category, tier, questPoints）从顶层字段读取

**保存 Quest：**
- 调用 `PUT /quests/:id`，将所有字段（元数据 + steps + defaultCriteria）一起提交
- 后端自动处理 dataDraft/dataPublic 分离，前端无需关心

**保存后的状态反馈：**
- 检查返回的 `hasPendingDraft`：
  - `true` → 显示"有待审批的游戏逻辑变更"提示
  - `false` → 变更已全部生效

### 8.3 发布审批流（针对 PUBLIC Quest）

**Author 视角：**

```
编辑 Quest（PUT /quests/:id）
     ↓
如果 Quest 是 PUBLIC，steps 改动后 hasPendingDraft = true
     ↓
等待 Admin 审批
     ↓
Admin promote 后，hasPendingDraft = false
```

**Admin 视角：**

```
在 Quest 列表或详情页看到 hasPendingDraft = true
     ↓
可查看 dataDraft vs dataPublic 对比
     ↓
调用 POST /quests/:id/promote 审批通过
   或通知 Author 修改
```

**前端建议的 UI 元素：**
- Quest 列表中：`hasPendingDraft` 为 true 时显示"待审批"标签
- Quest 详情页：当 `dataPublic` 存在且与 `dataDraft` 不同时，提供 diff 对比视图
- Admin 工具栏：promote 按钮（仅 PUBLIC + hasPendingDraft 时可用）

### 8.4 状态切换

前端应根据当前用户角色和 Quest ACL 控制状态切换按钮的可见性：

| 当前状态 | 可用操作 | 按钮可见条件 |
|---------|---------|------------|
| `PRIVATE` | → STAGING | Owner 或 Admin |
| `PRIVATE` | → PUBLIC | Admin only |
| `STAGING` | → PRIVATE | Owner 或 Admin |
| `STAGING` | → PUBLIC | Admin only |
| `PUBLIC` | → PRIVATE | Owner 或 Admin |
| `PUBLIC` | → STAGING | Owner 或 Admin |
| `PUBLIC` + pending | Promote | Admin only |

### 8.5 ACL 管理

- 仅 OWNER 或 ADMIN 可见 ACL 管理界面
- 使用 `PUT /quests/:id/acl` 整体替换
- 前端应校验：
  - 至少保留一个 OWNER
  - 当前用户（非 Admin）不能移除自己或将自己降级
- 输入 Discord User ID 即可添加成员（username 由后端后续填充）

### 8.6 MC UUID 绑定

- 在用户设置页提供"绑定 Minecraft 账号"入口
- 引导用户在 MC 服务器中执行指令获取绑定 token
- 调用 `POST /auth/bind-mc` 完成绑定
- 绑定成功后 `GET /auth/me` 会返回 `mcUuid`
- 提供"解除绑定"按钮调用 `DELETE /auth/bind-mc`

---

## 九、TypeScript 类型定义参考

```typescript
// ─── 通用 ───

interface UserRef {
  discordUserId: string;
  username: string;
}

interface AclEntry {
  discordUserId: string;
  discordUsername: string | null;
  role: "OWNER" | "EDITOR";
}

interface ApiError {
  error: string;
  message: string;
}

// ─── Quest ───

interface QuestData {
  steps: Step[];
  defaultCriteria: Criterion | null;
}

interface Step {
  criteria: Criterion;
  failureCriteria?: Criterion;
}

type Criterion = Record<string, any> & { type: string };

interface Quest {
  id: string;
  status: "PRIVATE" | "STAGING" | "PUBLIC";
  name: string;
  description: string | null;
  category: string | null;
  tier: string | null;
  questPoints: number;
  dataDraft: QuestData;
  dataPublic?: QuestData;         // 仅 PUBLIC 且有发布历史时存在
  hasPendingDraft: boolean;
  createdBy: UserRef;
  createdAt: number;
  lastModifiedBy: UserRef;
  lastModifiedAt: number;
  acl: AclEntry[];
}

interface QuestListItem {
  id: string;
  status: "PRIVATE" | "STAGING" | "PUBLIC";
  name: string;
  description: string | null;
  category: string | null;
  tier: string | null;
  questPoints: number;
  hasPendingDraft: boolean;
  createdBy: UserRef;
  lastModifiedAt: number;
  acl: AclEntry[];
}

interface QuestListResponse {
  items: QuestListItem[];
  total: number;
  page: number;
  size: number;
}

// ─── Category ───

interface QuestCategory {
  name: string;
  description: string;
  icon: string;
  order: number;
  tiers: Record<string, QuestTier>;
}

interface QuestTier {
  name: string;
  icon: string;
  order: number;
}

type CategoriesMap = Record<string, QuestCategory>;

// ─── Auth ───

interface MeResponse {
  discordUserId: string;
  username: string;
  roles: string[];
  mcUuid: string | null;
}
```
