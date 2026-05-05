# VRC Avatar Git 🎭

VRChatアバター制作向けのシンプルなGitクライアントです。

Gitの知識がなくてもUIだけで操作できます。

---

## 必要なもの

1. **Git for Windows**
   - https://git-scm.com/download/win
   - インストール時はデフォルト設定のままでOK

2. **Node.js**（開発用）
   - https://nodejs.org/

3. **GitHubアカウント**
   - あらかじめ作成＋リポジトリ作成済みであること

---

## セットアップ（開発環境）

```bash
# 依存関係インストール
npm install

#npm installで以下のようなエラーが出た場合
npm : このシステムではスクリプトの実行が無効になっているため、ファイル C:
\Program Files\nodejs\npm.ps1 を読み込むことができません。

# PowerShellを開いて実行ポリシーを変更
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# アプリ起動
npm start
```

---

## アプリの使い方

### 初回設定

1. 「⚙️ 設定」タブを開く
2. Unityプロジェクトフォルダを選択
3. GitHubリポジトリのURLを貼り付け
   - 例: `https://github.com/yourname/my-avatar`
4. Personal Access Token を貼り付け
   - [ここから作成](https://github.com/settings/tokens/new?scopes=repo&description=VRC+Avatar+Git)（`repo` スコープにチェック）
5. GitHubユーザー名とメールアドレスを入力
6. 「💾 設定を保存して接続」をクリック

### 日常の使い方

1. 「🎭 アバター管理」タブで変更ファイルを確認
2. 変更メモ（コミットメッセージ）を入力
3. 「📤 保存して送信」でGitHubに送信

---

## .gitignore について

初回接続時に自動生成されます。

`Assets/` などの素材フォルダは自動的に除外されます。

---

## ビルド（配布用 .exe 作成）

```bash
npm run build
```

`dist/` フォルダに `.exe` インストーラーが生成されます。
