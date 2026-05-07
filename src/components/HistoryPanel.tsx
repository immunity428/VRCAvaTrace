import { type FC, useState } from 'react'
import type { Commit } from '../types'
import { Button } from './ui'

interface RevertDialogProps {
  commit: Commit
  onConfirm: () => void
  onCancel: () => void
}

const RevertDialog: FC<RevertDialogProps> = ({ commit, onConfirm, onCancel }) => {
  const fmtDate = (d: string) =>
    new Date(d).toLocaleString('ja-JP', {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <div className="fixed inset-0 bg-[rgba(12,12,18,0.85)] backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-bg2 border border-border2 rounded-2xl p-7 max-w-[420px] w-[90%] shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
        <div className="text-3xl mb-3">⏪</div>
        <div className="text-[16px] font-bold mb-2">この状態に戻しますか？</div>

        {/* Unity警告 */}
        <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.35)] rounded-lg p-3 mb-3 text-[12px] text-red-400 flex gap-2 items-start">
          <span className="text-base flex-shrink-0">⚠️</span>
          <span>
            <strong>実行前にUnityを閉じてください。</strong>
            <br />Unityを開いたままだとファイルがロックされ正常に完了しません。
          </span>
        </div>

        {/* コミット情報 */}
        <div className="bg-bg3 border border-border rounded-lg p-3 mb-3">
          <div className="text-[12px] font-semibold text-text1 mb-1">{commit.message}</div>
          <div className="text-[10px] text-text3 font-mono">
            {commit.hash} · {fmtDate(commit.date)}
          </div>
        </div>

        {/* 説明 */}
        <div className="bg-bg3 border border-border rounded-lg p-3 mb-3 text-[12px] text-text2 leading-relaxed">
          💾 復元前の状態は<strong className="text-text1">自動でバックアップ</strong>されます。<br />
          復元後も「変更履歴」から復元前の状態に戻すことができます。
        </div>

        {/* ユースケース説明 */}
        <div className="flex flex-col gap-2 mb-4 text-[12px]">
          <div className="bg-bg3 border border-border rounded-lg p-2.5">
            <div className="font-bold text-text1 mb-1">💻 ローカルのみ復元（次の画面でキャンセル）</div>
            <div className="text-text2 leading-relaxed">
              自分のPCだけ過去の状態に戻します。<br />
              <span className="text-accent">「昨日の衣装に戻して試してみたい、気に入らなければ元に戻したい」</span>という時に便利。GitHubはそのままなので何度でもやり直せます。
            </div>
          </div>
          <div className="bg-bg3 border border-border rounded-lg p-2.5">
            <div className="font-bold text-text1 mb-1">☁️ GitHubにも反映（次の画面でOK）</div>
            <div className="text-text2 leading-relaxed">
              PCとGitHub両方を更新します。<br />
              <span className="text-accent">「別のPCでも同じ状態で作業したい」「このバージョンに完全に確定した」</span>という時に使います。
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onCancel}>やめる</Button>
          <Button variant="danger" onClick={onConfirm}>⏪ 復元する</Button>
        </div>
      </div>
    </div>
  )
}

interface HistoryPanelProps {
  commits: Commit[]
  onRevertLocal: (hash: string, message: string) => Promise<string | null>
  onRevertPush: (hash: string, message: string) => Promise<string | null>
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

export const HistoryPanel: FC<HistoryPanelProps> = ({
  commits, onRevertLocal, onRevertPush, onToast,
}) => {
  const [pendingCommit, setPendingCommit] = useState<Commit | null>(null)

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString('ja-JP', {
      month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  const handleConfirmRevert = async () => {
    if (!pendingCommit) return
    const commit = pendingCommit
    setPendingCommit(null)

    // ① ローカル復元
    const err = await onRevertLocal(commit.hash, commit.message)
    if (err) { onToast('復元エラー: ' + err, 'error'); return }
    onToast('✅ ローカルの復元が完了しました！', 'success')

    // ② GitHubへの反映確認
    const pushToGithub = window.confirm(
      'GitHubにも反映しますか？\n\n' +
      '「OK」→ GitHubも同じ状態に更新\n' +
      '「キャンセル」→ ローカルのみ復元\n\n' +
      '※ 復元前の状態は自動バックアップ済みです。\n' +
      '　 変更履歴から「この状態に戻す」でいつでも戻せます。\n' +
      '　 または「取得(Pull)」でGitHubの状態をローカルに反映できます。'
    )
    if (!pushToGithub) return

    const pushErr = await onRevertPush(commit.hash, commit.message)
    if (pushErr) onToast('GitHub反映エラー: ' + pushErr, 'error')
    else onToast('✅ GitHubにも反映しました！', 'success')
  }

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="px-6 pt-[18px] pb-3.5 border-b border-border flex-shrink-0">
          <div className="text-[18px] font-bold tracking-tight">📋 変更履歴</div>
          <div className="text-[12px] text-text3 mt-0.5">
            「この状態に戻す」で過去のバージョンに丸ごと戻せます
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {commits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-text3 gap-2">
              <span className="text-3xl opacity-50">📋</span>
              <span className="text-[13px]">まだ変更が保存されていません</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {commits.map((c, i) => (
                <div
                  key={c.hash}
                  className="bg-bg2 border border-border rounded-xl px-4 py-3 border-l-[3px] border-l-accent flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-text1 font-medium mb-1">{c.message}</div>
                    <div className="flex gap-2 text-[10px] text-text3 flex-wrap">
                      <span className="font-mono text-cyan-400">{c.hash}</span>
                      <span>{c.author}</span>
                      <span>{fmtDate(c.date)}</span>
                    </div>
                  </div>
                  {i === 0 ? (
                    <span className="text-[11px] text-text3 px-2.5 py-1.5 flex-shrink-0">現在</span>
                  ) : (
                    <button
                      onClick={() => setPendingCommit(c)}
                      className="flex-shrink-0 px-2.5 py-1.5 text-[11px] font-semibold rounded-md border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.1)] text-red-400 hover:bg-[rgba(239,68,68,0.22)] cursor-pointer font-sans transition-colors whitespace-nowrap"
                    >
                      ⏪ この状態に戻す
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {pendingCommit && (
        <RevertDialog
          commit={pendingCommit}
          onConfirm={handleConfirmRevert}
          onCancel={() => setPendingCommit(null)}
        />
      )}
    </>
  )
}
