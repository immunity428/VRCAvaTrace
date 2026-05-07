import { type FC, useState, useEffect } from 'react'
import type { AppConfig } from '../types'
import { Button, Input, Card } from './ui'
import { ipc } from '../lib/ipc'

interface SetupPanelProps {
  config: AppConfig | null
  gitInstalled: boolean
  onSave: (config: AppConfig) => Promise<string | null>
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

export const SetupPanel: FC<SetupPanelProps> = ({
  config, gitInstalled, onSave, onToast,
}) => {
  const [folder, setFolder] = useState(config?.folder ?? '')
  const [repoUrl, setRepoUrl] = useState(config?.repoUrl ?? '')
  const [token, setToken] = useState(config?.token ?? '')
  const [userName, setUserName] = useState(config?.userName ?? '')
  const [userEmail, setUserEmail] = useState(config?.userEmail ?? '')

  useEffect(() => {
    if (config) {
      setFolder(config.folder)
      setRepoUrl(config.repoUrl)
      setToken(config.token)
      setUserName(config.userName)
      setUserEmail(config.userEmail)
    }
  }, [config])

  const handleSelectFolder = async () => {
    const f = await ipc.selectFolder()
    if (f) setFolder(f)
  }

  const handleSave = async () => {
    if (!folder) { onToast('プロジェクトフォルダを選択してください', 'error'); return }
    if (!repoUrl) { onToast('リポジトリURLを入力してください', 'error'); return }
    if (!token) { onToast('Personal Access Tokenを入力してください', 'error'); return }
    const err = await onSave({ folder, repoUrl, token, userName, userEmail })
    if (err) onToast('エラー: ' + err, 'error')
    else onToast('✅ 設定を保存しました！', 'success')
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 pt-[18px] pb-3.5 border-b border-border flex-shrink-0">
        <div className="text-[18px] font-bold tracking-tight">⚙️ 設定</div>
        <div className="text-[12px] text-text3 mt-0.5">プロジェクトとGitHubの接続設定</div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {/* Git未インストール警告 */}
        {!gitInstalled && (
          <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-xl p-5">
            <div className="text-[14px] font-bold text-red-400 mb-2">⚠️ Gitがインストールされていません</div>
            <div className="text-[12px] text-text2 mb-3">
              このアプリを使うにはGitのインストールが必要です。インストール後にアプリを再起動してください。
            </div>
            <Button
              variant="secondary"
              className="text-[12px] py-1.5"
              onClick={() => ipc.openExternal('https://git-scm.com/download/win')}
            >
              🔗 Git for Windows をダウンロード
            </Button>
          </div>
        )}

        {/* プロジェクトフォルダ */}
        <Card>
          <div className="text-[13px] font-bold mb-4 flex items-center gap-2">
            <span className="text-lg">📁</span> Unityプロジェクト
          </div>
          <label className="block text-[12px] text-text2 font-medium mb-1.5">
            プロジェクトフォルダ
          </label>
          <div className="flex gap-2">
            <Input value={folder} readOnly placeholder="フォルダを選択してください" className="flex-1" />
            <Button variant="secondary" onClick={handleSelectFolder}>選択</Button>
          </div>
        </Card>

        {/* GitHub接続 */}
        <Card>
          <div className="text-[13px] font-bold mb-4 flex items-center gap-2">
            <span className="text-lg">🐙</span> GitHub接続
          </div>

          <div className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[12px] text-text2 font-medium mb-1.5">
                リポジトリURL
              </label>
              <Input
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/あなたのユーザー名/リポジトリ名"
              />
              <div className="mt-1.5 bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] rounded-md px-2.5 py-2 text-[11px] text-yellow-400">
                ⚠️ リポジトリは必ず <strong>Private（非公開）</strong> で作成してください。
                Publicにすると購入素材が全世界に公開されてしまいます。
              </div>
            </div>

            <div>
              <label className="block text-[12px] text-text2 font-medium mb-1.5">
                Personal Access Token
              </label>
              <Input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
              <div className="mt-1 text-[11px] text-text3">
                <button
                  className="text-accent hover:underline bg-none border-none cursor-pointer font-sans text-[11px]"
                  onClick={() =>
                    ipc.openExternal(
                      'https://github.com/settings/tokens/new?scopes=repo&description=VRC+Avatar+Git'
                    )
                  }
                >
                  🔗 GitHubでトークンを作成する
                </button>
                （「repo」スコープにチェックを入れてください）
              </div>
            </div>

            <div>
              <label className="block text-[12px] text-text2 font-medium mb-1.5">
                GitHubユーザー名
              </label>
              <Input
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="あなたのGitHubユーザー名"
              />
            </div>

            <div>
              <label className="block text-[12px] text-text2 font-medium mb-1.5">
                メールアドレス（GitHubに登録しているもの）
              </label>
              <Input
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>
        </Card>

        <Button variant="primary" className="w-full" onClick={handleSave}>
          💾 設定を保存して接続
        </Button>
      </div>
    </div>
  )
}
