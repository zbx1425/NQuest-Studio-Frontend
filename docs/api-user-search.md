# 新增后端 API：用户搜索

> 前端 ACL 管理需要按用户名搜索已注册用户，避免手动输入 Discord User ID。

---

## `GET /api/v1/users/search`

搜索已登录过 NQuest Studio 的用户（按 Discord 用户名模糊匹配）。

### 认证

- **Bearer JWT**（必须）
- **权限**：AUTHOR 或 ADMIN

### Query 参数

| 参数    | 类型     | 必填 | 默认 | 说明                        |
|---------|----------|------|------|-----------------------------|
| `q`     | `string` | 是   | —    | 搜索关键词，至少 2 个字符    |
| `limit` | `number` | 否   | 10   | 返回结果数量上限（最大 20）  |

### 成功响应：`200`

```json
[
  {
    "discordUserId": "123456789",
    "username": "PlayerOne"
  },
  {
    "discordUserId": "987654321",
    "username": "PlayerTwo"
  }
]
```

返回 `UserRef[]` 数组，按用户名字母序排列。

### 搜索范围

仅限数据库中已有记录的用户（即曾经通过 Discord OAuth 登录过 NQuest Studio 的用户）。

推荐实现方式：`WHERE username ILIKE '%' || :q || '%' LIMIT :limit`

### 错误

| HTTP | error             | 说明                            |
|------|-------------------|---------------------------------|
| 400  | `INVALID_REQUEST` | `q` 参数缺失或长度不足 2 字符    |
| 401  | `UNAUTHORIZED`    | 未认证                           |
| 403  | `FORBIDDEN`       | 无 AUTHOR/ADMIN 角色             |

### TypeScript 类型

```typescript
// Request
interface SearchUsersParams {
  q: string;
  limit?: number;  // default 10, max 20
}

// Response
type SearchUsersResponse = UserRef[];

interface UserRef {
  discordUserId: string;
  username: string;
}
```

### 前端调用方式

前端在 ACL 编辑器的"添加成员"处使用此接口：

- 使用 Fluent UI `Combobox` 组件
- 用户输入时 debounce 300ms 后调用
- 下拉展示匹配结果（用户名 + Discord ID）
- 选中后自动填入 ACL 条目
- 同时保留手动输入 Discord User ID 的备用方式（Combobox 支持自由输入）
