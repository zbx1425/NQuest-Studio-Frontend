# 排行榜排名时间：排除第一步用时 API 文档

为了促进排行榜排序公平性（考虑玩家传送或起点不同的影响），后端现已支持“在排行榜排名时抛去第一步用时”的功能。

此文档列出了该功能对前端所有相关接口及数据结构的改动。

---

## 术语与核心概念

1.  **`durationMillis`（不变）**：玩家完成该 Quest 所用的完整时长。
2.  **`rankingDurationMillis`（新增）**：用于参与后端所有排序、PB（个人最佳）、WR（世界纪录）和 Rank 排名的时长。
    *   如果该 Quest 开启了 `excludeFirstStep`，并且该记录包含第一步（`step_details["0"]`）的时间，则 `rankingDurationMillis` = `durationMillis - 第一步时间`。
    *   否则，`rankingDurationMillis` = `durationMillis`。

> [!NOTE]
> 前端在展示“完成时间”时，应当首要展示 `rankingDurationMillis`，同时次要展示 `durationMillis`。

---

## Quest 属性变更

作者现在可以在编辑 Quest 时设置是否排除第一步用时。

### 1. `POST /quests` & `PUT /quests/{id}`

在创建和更新 Quest 的请求体中，新增了可选的参数：

```ts
interface CreateQuestRequest / UpdateQuestRequest {
  // ... 其他属性
  excludeFirstStep?: boolean; // 默认为 false
}
```

### 2. Quest 响应体 & Sync Bundle

在 `GET /quests` (List)、`GET /quests/{id}` (Detail)、以及 `/sync/bundle` 返回的 [QuestSync](file:///c:/Users/zbx1425/Documents/Backend/nquest-studio/src/models/quest.rs#67-80) 模型中，新增了此字段：

```ts
interface Quest {
  // ... 其他属性
  excludeFirstStep: boolean;
}
```

---

## 游戏数据/排行榜接口变更

所有原先返回 `durationMillis` 的端点，现在 **全部额外** 返回 `rankingDurationMillis`（无论是提交、历史记录还是排行榜）。

**关键点：后端的所有的 `isPersonalBest`, `isWorldRecord`, [rank](file:///c:/Users/zbx1425/Documents/Backend/nquest-studio/src/routes/quests.rs#761-869) 现在都是基于 `rankingDurationMillis` 计算的。**

### 1. `POST /completions`

提交成绩后返回的数据，增加了 `rankingDurationMillis`。

```ts
interface SubmitCompletionResponse {
  completionId: number;
  rankingDurationMillis: number; // 新增：计算后的排名用时
  // 下面的 PB/WR/Rank 现在基于 rankingDurationMillis
  isPersonalBest: boolean;
  isWorldRecord: boolean;
  rank: number;
  qpBalance: number;
  totalQuestCompletions: number;
}
```

### 2. `GET /leaderboards/speedrun/{quest_id}`

Speedrun 排行榜现在**按照 `rankingDurationMillis` 进行升序排序**。

```ts
interface SpeedrunEntry {
  rank: number;
  playerUuid: string;
  playerName: string;
  durationMillis: number;         // 原有：完整总时间
  rankingDurationMillis: number;  // 新增：也就是当前用于排序的时间
  completionTime: number;
  completionId: number;
  isWorldRecord: boolean;         // 基于 rankingDurationMillis 判断
  stepDetails?: any;
}
```

### 3. `GET /players/{uuid}/profile` (最近活动)

```ts
interface ProfileRecentEntry {
  isPersonalBest: boolean;
  questId: string;
  questName: string;
  durationMillis: number;
  rankingDurationMillis: number; // 新增
  completionTime: number;
}
```

### 4. `GET /players/{uuid}/history` (历史记录)

```ts
interface HistoryEntry {
  completionId: number;
  questId: string;
  questName: string;
  completionTime: number;
  durationMillis: number;
  rankingDurationMillis: number; // 新增
  questPoints: number;
  stepDetails?: any;
  isPersonalBest: boolean;
  disqualified: boolean;
}
```

### 5. `GET /players/{uuid}/personal-bests` (个人最佳)

这里的排序和 [rank](file:///c:/Users/zbx1425/Documents/Backend/nquest-studio/src/routes/quests.rs#761-869) 都是基于 `rankingDurationMillis`。

```ts
interface PersonalBestEntry {
  questId: string;
  questName: string;
  durationMillis: number;
  rankingDurationMillis: number; // 新增：该纪录的排名时间
  completionTime: number;
  rank: number;
}
```

---

## 统计分析接口变更

### `GET /quests/{quest_id}/stats`

为了兼容不同需求，新增了一个 Query 参数 `durationType`，前端可以通过此参数决定平均值、中位数和世界纪录基于哪个字段。

-   **`?durationType=ranking`**（ **默认行为** ）：后续返回的所有全局统计基于 `ranking_duration_millis` 计算。
-   **`?durationType=total`**：基于原有的 `duration_millis` 计算。

```ts
// GET /quests/{quest_id}/stats?durationType=ranking (默认)
interface QuestStatsResponse {
  questId: string;
  questName: string;
  totalRuns: number;
  uniqueRunners: number;
  averageDurationMillis?: number; // 根据 durationType 决定是哪种平均值
  medianDurationMillis?: number;  // 根据 durationType 决定是哪种中位数
  worldRecord?: {
    playerUuid: string;
    playerName: string;
    durationMillis: number;
    rankingDurationMillis: number; // 新增：始终返回（仅后补）
    completionTime: number;
  };
  stepAnalytics: Array<{...}>;    // 不受 durationType 影响，仍直接读取 JSON 数据
}
```

---

## 异步回填机制与进度查询

当 Quest 作者将 `excludeFirstStep` 的值修改（`false -> true` 或 `true -> false`）并保存后：

1.  后端会抛出一个异步防抖任务（`RANKING_RECALC`）。
2.  该任务会**自动重新计算**该 Quest 对应的过去所有的 `rankingDurationMillis`。

### 查询重算进度

为了提供更好的交互反馈，前端可轮询此接口查询当前的重算进度：

**`GET /admin/jobs/recalc-{quest_id}`**
>  注意：虽然是 `/admin` 接口，但此接口已对对应 Quest 的**作者放开提取权限**。只要当前用户是该 Quest 的 Owner，就能正常查询自己发起的重算进度。

返回数据示例：

```json
{
  "jobId": "recalc-fe8a8...",
  "type": "RANKING_RECALC",
  "status": "PROCESSING",  // 或者 COMPLETED, FAILED
  "progress": {
    "processed": 1000,
    "total": 5340
  },
  "createdAt": 1709556811234,
  "completedAt": null
}
```

前端可以通过计算 `processed / total * 100` 显示进度条。当 [status](file:///c:/Users/zbx1425/Documents/Backend/nquest-studio/src/routes/admin.rs#318-360) 变为 `COMPLETED`，说明新排行榜已经完全构建。
