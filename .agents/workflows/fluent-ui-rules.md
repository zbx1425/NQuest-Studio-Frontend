---
description: Project tech stack, conventions and important tips.
---

## 项目技术栈

Next.JS、React、Tailwind、Fluent UI React (@fluentui/react-components)

Redux、Redux-Persist、RTK-Query

项目语言：英语

## Conventions
- 避免使用 useStyle，使用 Tailwind
- 避免使用 Fluent UI 的 Typography 组件，使用 Tailwind
- 所有 API 调用出错时的返回 Body 格式为： { error: string; message?: string | any; }，将 error 和 message 都显示给用户。
- 在用户的操作失败和成功时显示 Toast 或 Dialog 来提示用户。

## 重要提示
- 本项目为静态编译部署。不要使用 Next.JS 的动态路由功能。
- 不要运行 mkdir！当你写入文件时，文件夹会被自动创建
- 本项目有 en、zh(繁体)、zh-CN、ja、ko 的几个语言。你的上下文有限，不要读取或写入 I18n 文件。将要写入的内容给我汇总，我来人工写入。
