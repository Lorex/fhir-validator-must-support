# FHIR MustSupport 欄位驗證工具（猴子也能學會使用的指南）

這個專案是一個簡單的工具，用來驗證你有沒有在 FHIR Resource 中漏填必須支援的欄位（MustSupport）。

## 安裝
### 安裝執行環境

1. 請點 [這個連結](https://nodejs.org/en) 下載 Node.js 並安裝。
2. 完成安裝後，請打開終端機，並執行以下指令安裝 Yarn：
```bash
$ npm install -g corepack
$ corepack enable
$ yarn set version stable
$ yarn install
```
### 下載本工具
1. 點擊 [這裡](https://github.com/Lorex/fhir-validator-must-support/archive/refs/heads/main.zip) 下載 ZIP 檔案。 
2. 解壓縮 ZIP 檔案。
3. 打開終端機，並切換到本工具的目錄，然後執行以下指令安裝相依套件：
```bash
$ yarn
```

## 設定
打開 `config.json` 檔案，並設定以下屬性，可直接複製貼上就好：
```json
{
  "package": "tw.gov.mohw.twcore",
  "version": "0.2.2",
  "cachePath": "./ig_cache"
}
```
以上設定將會抓取 **TW Core 台灣核心實作指引 0.2.2** 來進行驗證。

## 執行
請開啟終端機，並切換到本工具的目錄。
### 使用範例測試檔
一個驗證成功的案例：（使用此範例將會看到驗證成功的訊息）
```bash
$ node index.js -e valid
```
一個驗證失敗的案例：（使用此範例將會看到驗證失敗的訊息）
```bash
$ node index.js -e invalid
```
### 使用你自己的檔案
你可以把想驗證的 FHIR 資源檔案放在本工具的資料夾中，然後執行以下指令：
```bash
$ node index.js -f <檔案名稱>.json
```