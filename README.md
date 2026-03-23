# star-chart-lab

這是一個聚焦「星座 / 星盤」的網站工作區。

## 目前狀態
- 已完成第一版 MVP
- 可輸入出生日期、時間、出生地
- 可查詢真實地點資料
- 可生成本命盤、十二宮、主要行星落點與規則式分析
- 已預留 AI API route 與 env 位置，待哥哥填入 key 後即可啟用

## 目前功能
- 個人本命盤計算
- 十二宮位置與主要行星落點
- 緊密相位摘要
- 規則式星盤分析
- AI 建議區塊預留

## 技術選型
- 前端：Vite + React + TypeScript
- 後端：Express + TypeScript
- 星盤計算：`circular-natal-horoscope-js`
- 地點搜尋：Nominatim
- 地點 / 時區解算：使用地點座標進行本地換算，不需額外註冊外部帳號
- AI 預留：OpenAI 或 Gemini

## 啟動方式
1. 安裝依賴
   - `npm install`
2. 複製環境檔
   - 參考 `.env.example`
3. 啟動開發環境
   - `npm run dev`
   - 前端開發網址預設為 `http://localhost:8200`
4. 產出生產版
   - `npm run build`
5. 啟動 production server
   - `npm run start`

## 環境變數
- `PORT`：本機 API port，預設 `8787`
- `NOMINATIM_EMAIL`：選填，對公開地點搜尋服務表明身份
- `OPENAI_API_KEY`：之後要啟用 OpenAI 建議時填入
- `OPENAI_MODEL`：預設 `gpt-5-mini`
- `GEMINI_API_KEY`：之後要啟用 Gemini 建議時填入
- `GEMINI_MODEL`：預設 `gemini-2.5-pro`

## 第二階段
- 運勢分析
- AI 個人化建議正式接通
- 更多盤面模組與分享能力
