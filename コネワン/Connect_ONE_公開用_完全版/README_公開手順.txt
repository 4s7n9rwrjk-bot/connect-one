# Connect ONE 公開用 完全版

## 今回追加したもの
- 地点検索に連動した天気
- 地点検索に連動した日の出・日の入り
- 地点検索に連動したMAP
- 地点検索に連動した近傍の潮汐
- **地点検索に連動した服装指数**
  - 現在の気温・体感温度・風速・降水確率・天気コードから独自の目安を算出
  - 5日分の服装目安も表示
  - 100に近いほど薄着向き
- Web / ニュース / 画像 / 動画検索用のExpress APIを同梱
- `/health` ヘルスチェック
- Render向け `render.yaml` を同梱

## 重要
服装指数はConnect ONE独自の目安であり、気象庁などの公式な「服装指数」ではありません。

## 公開の最短手順（Render）
1. このフォルダをGitHubリポジトリにアップロード。
2. Renderで **New → Web Service** を選択。
3. GitHubリポジトリを接続。
4. Build Command: `npm install`
5. Start Command: `npm start`
6. 環境変数に `.env.example` のキーを登録。
7. Deploy。
8. `https://あなたのサービス名.onrender.com/` を開いて動作確認。
9. `/health` が `{"ok":true,...}` を返すことを確認。

## Google Sitesに「完全版」を載せる
Google Sites側ではアプリ本体をホストするのではなく、公開したConnect ONEのURLを埋め込みます。

1. Google Sitesで編集画面を開く。
2. 「挿入」→「埋め込む」→「URL」。
3. Renderで公開したConnect ONEのURLを入力。
4. 必要なら「ページ全体の埋め込み」を使う。
5. Google Sitesを「公開」。
6. 公開後のGoogle SitesからConnect ONEが開けることを確認。

## APIキー
APIキーはブラウザ側のHTMLに書かず、RenderのEnvironment Variablesに入れてください。
`.env` をGitHubにコミットしないでください。

## GitHub Pagesについて
GitHub Pagesは静的ファイル向けなので、HTMLだけを置くと天気・地図・潮汐・服装指数などは動かせますが、同梱の `/api/search` は動きません。
Web/ニュース/画像/動画まで完全に使う場合は、このNode/Express版をWeb Serviceとして公開してください。
