# <a id="top"></a>

<p align="center">
  <img src="./src/assets/hero.png" alt="Star Chart Lab emblem" width="180" />
</p>

<h1 align="center">Star Chart Lab</h1>

<p align="center">
  A western astrology natal chart lab focused on turning birth data into a readable personal dossier.
  <br />
  將出生資料整理成可閱讀個人命盤的雙語網站原型。
</p>

<p align="center">
  <a href="#zh-tw">中文</a>
  |
  <a href="#en">English</a>
</p>

---

## <a id="zh-tw"></a>中文

### 專案簡介
`star-chart-lab` 是一個聚焦西洋占星本命盤體驗的網站原型。它的目標不是再做一頁泛泛的星座內容，而是把出生日期、時間、地點整理成一份比較有閱讀節奏的個人命盤說明，讓使用者先看到可驗證的盤面結果，再逐步延伸到 AI 建議、Email 交付與付費體驗。

### 目前亮點
- 輸入出生日期、出生時間、出生地點後，可產出本命盤資料
- 透過 Nominatim 搜尋真實地點並取得座標
- 產生太陽、月亮、上升、宮位與主要行星落點摘要
- 內建規則式解讀流程，可先驗證閱讀體驗與資料流
- 前端已支援繁中 / 英文切換
- 後端已預留 AI 分析與 Email 交付 route，方便第二階段接通

### 專案定位
- 主題範圍：西洋占星、本命盤、個人化閱讀體驗
- 目前階段：MVP 已成形，持續整理產品結構與展示方式
- 第一優先：先把資料流、命盤結果與基本解讀閉環跑穩
- 第二階段：再接 AI 建議、Email 交付、更多運勢模組與付費流程

### 技術棧
- Frontend: Vite + React + TypeScript
- Backend: Express + TypeScript
- Database schema: Prisma
- Natal chart engine: `circular-natal-horoscope-js`
- Place lookup: Nominatim
- Reserved AI providers: OpenAI / Gemini

### 本機啟動
```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

開發環境預設：
- 前端：`http://localhost:8200`
- API：`http://localhost:8787`

Production build:
```powershell
npm run build
npm run start
```

### 環境變數
- `PORT`: API port，預設 `8787`
- `VITE_API_BASE_URL`: 前端要改接其他 API 時可填
- `DATABASE_URL`: Prisma / PostgreSQL 連線字串
- `NOMINATIM_EMAIL`: 選填，用來表明地點搜尋請求身份
- `AI_PROVIDER`: 選擇 AI provider
- `OPENAI_API_KEY` / `OPENAI_MODEL`: OpenAI 設定
- `GEMINI_API_KEY` / `GEMINI_MODEL`: Gemini 設定
- `EMAIL_DELIVERY_API_URL` / `EMAIL_DELIVERY_API_KEY`: Email 交付預留設定

### 目前倉庫內的重點模組
- `src/`: React 前端頁面、雙語文案、圖表元件
- `server/`: Express API、地點搜尋、命盤解讀、AI / Email 預留接口
- `prisma/`: 資料模型骨架

### 接下來的方向
- 補強完整個人檔案頁的閱讀節奏
- 接上 AI 個人化解讀
- 接上 Email 交付與後續自動化流程
- 規劃每週 / 每月運勢模組與付費體驗

[回到頂部](#top)

---

## <a id="en"></a>English

### Overview
`star-chart-lab` is a western astrology natal chart prototype focused on turning birth date, time, and place into a more readable personal dossier. Instead of shipping another generic zodiac page, the project is building a verifiable chart flow first, then extending it into AI insights, email delivery, and a stronger premium reading experience.

### Current Highlights
- Generate natal chart data from birth date, time, and place
- Search real locations with Nominatim and resolve coordinates
- Show Sun, Moon, Rising, houses, and major planetary placements
- Use rule-based interpretation as the first validation layer
- Support bilingual UI content in Traditional Chinese and English
- Keep AI insight and email delivery routes ready for the next phase

### Product Focus
- Scope: western astrology, natal chart reading, personalized experience
- Stage: MVP is in place and the repo is being shaped for product iteration
- Current priority: stabilize the flow from input to chart result to readable interpretation
- Next priority: connect AI insights, email delivery, premium reading, and forecast modules

### Tech Stack
- Frontend: Vite + React + TypeScript
- Backend: Express + TypeScript
- Database schema: Prisma
- Natal chart engine: `circular-natal-horoscope-js`
- Place lookup: Nominatim
- Reserved AI providers: OpenAI / Gemini

### Run Locally
```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Default local URLs:
- Frontend: `http://localhost:8200`
- API: `http://localhost:8787`

Production build:
```powershell
npm run build
npm run start
```

### Environment Variables
- `PORT`: API port, default `8787`
- `VITE_API_BASE_URL`: optional frontend API base override
- `DATABASE_URL`: Prisma / PostgreSQL connection string
- `NOMINATIM_EMAIL`: optional identity hint for place search requests
- `AI_PROVIDER`: selected AI provider
- `OPENAI_API_KEY` / `OPENAI_MODEL`: OpenAI settings
- `GEMINI_API_KEY` / `GEMINI_MODEL`: Gemini settings
- `EMAIL_DELIVERY_API_URL` / `EMAIL_DELIVERY_API_KEY`: reserved email delivery settings

### Repository Areas
- `src/`: React UI, bilingual copy deck, chart components
- `server/`: Express API, place lookup, interpretation services, reserved AI / email endpoints
- `prisma/`: database schema foundation

### Roadmap
- Refine the full personal dossier reading flow
- Connect AI-powered personal interpretation
- Connect email delivery and automation hooks
- Expand weekly / monthly forecast modules and premium layers

[Back to top](#top)
