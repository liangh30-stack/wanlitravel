# Wanlitravel — B2B Travel Gateway · Europe & China

万里旅行官网。连接欧洲与中国的 B2B 批发旅游运营商网站，支持英文 / 中文 / 西班牙语三语切换。

## 技术栈

- React 19 + TypeScript + Vite 6
- Tailwind CSS 4（via `@tailwindcss/vite`）
- Motion（Framer Motion 系列）动画
- React Router 7

## 本地运行

```bash
npm install
npm run dev        # http://localhost:3000
```

其他命令：`npm run build`（打包）、`npm run lint`（TypeScript 类型检查）。

## 项目结构

```
src/
  App.tsx           # 首页全部板块（导航、Hero、数据统计、B2B、路线、表单、页脚）
  RouteDetails.tsx  # 路线详情页（/route/:id）
  data.ts           # 路线数据：编号、天数、净价、行程（语言无关）
  translations.ts   # 三语文案（en / zh / es），所有 UI 文本集中在此
  context.ts        # 语言 Context
  index.css         # 全局样式与设计变量
public/             # 本地化图片资源（logo、hero、路线图）
```

## 内容维护

- 改文案 → `src/translations.ts`（三种语言都要同步改）
- 改路线（价格、编号、天数、行程）→ `src/data.ts` + `translations.ts` 中对应的 `routes` 条目
- 换图片 → `public/`，路线卡片图在 `data.ts` 的 `img` 字段

## 历史版本

`_archive/static-site-v1/` 保存了 2026 年 4 月的第一版纯静态站（4 个 HTML 页面），仅作归档参考，不再维护。本项目已整合其独有内容（路线编号、价格、行程天数、马德里/北京双时钟、B2B 申请表字段）。
