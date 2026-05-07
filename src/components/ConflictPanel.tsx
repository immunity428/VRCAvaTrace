import { type FC, useState } from 'react'
import { Button } from './ui'

interface ConflictPanelProps {
  folderPath: string
  onResolveLocal: () => Promise<string | null>
  onResolveRemote: () => Promise<string | null>
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void
  onClose: () => void
}

export const ConflictPanel: FC<ConflictPanelProps> = ({
  onResolveLocal,
  onResolveRemote,
  onToast,
  onClose,
}) => {
  const [resolving, setResolving] = useState(false)

  const handleLocal = async () => {
    setResolving(true)
    const err = await onResolveLocal()
    setResolving(false)
    if (err) onToast('エラー: ' + err, 'error')
    else { onToast('✅ ローカルの状態でGitHubを上書きしました', 'success'); onClose() }
  }

  const handleRemote = async () => {
    setResolving(true)
    const err = await onResolveRemote()
    setResolving(false)
    if (err) onToast('エラー: ' + err, 'error')
    else { onToast('✅ GitHubの状態でローカルを上書きしました', 'success'); onClose() }
  }

  return (
    <div className="fixed inset-0 bg-[rgba(12,12,18,0.9)] backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-bg2 border border-[rgba(239,68,68,0.4)] rounded-2xl p-7 max-w-[480px] w-[90%] shadow-[0_8px_40px_rgba(0,0,0,0.6)]">

        <div className="text-3xl mb-3">⚠️</div>
        <div className="text-[16px] font-bold mb-2 text-red-400">GitHubと履歴がズレています</div>

        <div className="text-[13px] text-text2 leading-relaxed mb-5">
          ローカルPCとGitHubの変更履歴が食い違っています。<br />
          どちらの状態を正とするか選んでください。
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {/* ローカル優先 */}
          <div className="bg-bg3 border border-border rounded-xl p-4">
            <div className="font-bold text-text1 mb-1.5 flex items-center gap-2">
              <span>💻</span> 自分のPC（ローカル）を優先する
            </div>
            <div className="text-[12px] text-text2 leading-relaxed mb-3">
              今の自分のPCの状態でGitHubを上書きします。<br />
              <span className="text-accent">📌 こんな時：「自分のPCの状態が正しい。GitHubを合わせたい」</span>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleLocal}
              disabled={resolving}
            >
              💻 ローカルでGitHubを上書き
            </Button>
          </div>

          {/* GitHub優先 */}
          <div className="bg-bg3 border border-border rounded-xl p-4">
            <div className="font-bold text-text1 mb-1.5 flex items-center gap-2">
              <span>☁️</span> GitHub を優先する
            </div>
            <div className="text-[12px] text-text2 leading-relaxed mb-3">
              GitHubの状態でローカルPCを上書きします。<br />
              <span className="text-accent">📌 こんな時：「GitHubの状態が正しい。ローカルをそれに合わせたい」</span>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleRemote}
              disabled={resolving}
            >
              ☁️ GitHubでローカルを上書き
            </Button>
          </div>
        </div>

        <div className="bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] rounded-lg px-3.5 py-2.5 text-[11px] text-yellow-400">
          ⚠️ どちらを選んでも、上書きされた側のデータは失われます。慎重に選んでください。
        </div>
      </div>
    </div>
  )
}
