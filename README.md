# VRC Avatar Git 🎭

VRChatアバター制作向けのシンプルなGitバックアップツールです。

Gitの知識がなくてもボタンを押すだけでアバターのバックアップが取れます。

---

## 📦 ダウンロードして使う（一般ユーザー向け）

### 必要なもの

1. **Git for Windows**
   - https://git-scm.com/download/win
   - インストール時はデフォルト設定のままでOK

2. **GitHubアカウント**
   - https://github.com/
   - 無料で作成できます
   - **リポジトリは必ず「Private（非公開）」で作成してください**

### インストール手順

1. [Releases](../../releases) から最新の `.exe` をダウンロード
2. インストーラーを実行してインストール
3. アプリを起動する

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
2. 変更メモを入力（例：「衣装マテリアルを調整」）
3. 「📤 保存して送信」でバックアップ完了！

### 過去の状態に戻したい場合

> ⚠️ **復元前に必ずUnityを閉じてください**

1. Unityを閉じる
2. 「📋 変更履歴」タブを開く
3. 戻したいバージョンの「⏪ この状態に戻す」を押す
4. 完了後にUnityを開き直す

詳しい使い方はアプリ内の「📖 使い方」タブを参照してください。

---

## 🛠️ 開発者向け

### 必要なもの

1. **Git for Windows**
   - https://git-scm.com/download/win
   - インストール時はデフォルト設定のままでOK

2. **Node.js**（開発用）
   - https://nodejs.org/

3. **GitHubアカウント**
   - あらかじめ作成＋リポジトリ作成済みであること

### セットアップ

```bash
# 依存関係インストール
npm install

# npm installで以下のようなエラーが出た場合
# npm : このシステムではスクリプトの実行が無効になっているため...
# PowerShellを開いて実行ポリシーを変更
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# アプリ起動
npm start
```

### ビルド（配布用 .exe 作成）

```bash
npm run build
```

`dist/` フォルダに `.exe` インストーラーが生成されます。

### .gitignore について

初回接続時に自動生成されます。

`Assets/` など素材フォルダは自動的に除外されます。
