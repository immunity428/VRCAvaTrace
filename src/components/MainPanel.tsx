import { type FC, useState } from 'react'
import type { AppConfig, ChangedFile, Commit } from '../types'
import {
  Button, Badge, SectionTitle, Card, Textarea, WarnBanner,
} from './ui'

const STATUS_LABEL: Record<string, string> = {
  modified: '変更', added: '追加', deleted: '削除', untracked: '新規', renamed: '改名',
}
const STATUS_CLASS: Record<string, string> = {
  modified: 'bg-[rgba(124,106,247,0.2)] text-[#7c6af7]',
  added: 'bg-[rgba(34,197,94,0.2)] text-green-400',
  deleted: 'bg-[rgba(239,68,68,0.2)] text-red-400',
  untracked: 'bg-[rgba(6,182,212,0.2)] text-cyan-400',
  renamed: 'bg-[rgba(124,106,247,0.2)] text-[#7c6af7]',
}

interface MainPanelProps {
  config: AppConfig | null
  files: ChangedFile[]
  commits: Commit[]
  onRefreshStatus: () => void
  onCommitPush: (msg: string) => Promise<string | null>
  onPull: () => Promise<string | null>
  onNavigateSetup: () => void
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

export const MainPanel: FC<MainPanelProps> = ({
  config, files, commits, onRefreshStatus, onCommitPush, onPull,
  onNavigateSetup, onToast,
}) => {
  const [commitMsg, setCommitMsg] = useState('')

  const handlePush = async () => {
    if (!commitMsg.trim()) { onToast('変更メモを入力してください', 'error'); return }
    const err = await onCommitPush(commitMsg)
    if (err) onToast('送信エラー: ' + err, 'error')
    else { setCommitMsg(''); onToast('✅ GitHubに送信しました！', 'success') }
  }

  const handlePull = async () => {
    const err = await onPull()
    if (err) onToast('取得エラー: ' + err, 'error')
    else onToast('✅ 最新データを取得しました', 'success')
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-6 pt-[18px] pb-3.5 border-b border-border flex-shrink-0">
        <div className="text-[18px] font-bold tracking-tight">🎭 アバター管理</div>
        <div className="text-[12px] text-text3 mt-0.5">
          {config?.folder?.split(/[/\\]/).pop() ?? 'プロジェクトを設定してください'}
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4 flex flex-col gap-3.5">
        {!config && (
          <WarnBanner>⚠️ プロジェクトが未設定です。設定タブから設定してください。</WarnBanner>
        )}

        <div className="grid grid-cols-[1fr_280px] gap-3.5 flex-1 overflow-hidden">
          {/* 左カラム */}
          <div className="flex flex-col gap-3.5 overflow-hidden min-h-0">
            {/* ファイルリスト */}
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <SectionTitle
                right={
                  <div className="flex items-center gap-2">
                    <Badge count={files.length} />
                    <button
                      onClick={onRefreshStatus}
                      className="w-[30px] h-[30px] bg-bg3 border border-border rounded-lg text-text2 hover:text-text1 hover:border-border2 transition-colors cursor-pointer text-sm"
                    >
                      ↻
                    </button>
                  </div>
                }
              >
                変更されたファイル
              </SectionTitle>

              <div className="bg-bg2 border border-border rounded-xl overflow-y-auto flex-1 min-h-0 scrollbar-thin">
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-text3 gap-2">
                    <span className="text-3xl opacity-50">✨</span>
                    <span className="text-[13px]">変更なし</span>
                  </div>
                ) : (
                  files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border last:border-none hover:bg-white/[0.02] transition-colors"
                    >
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${STATUS_CLASS[f.status] ?? STATUS_CLASS.modified}`}
                      >
                        {STATUS_LABEL[f.status] ?? f.status}
                      </span>
                      <span className="text-text2 font-mono text-[11px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {f.path}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* コミットエリア */}
            <div className="bg-bg2 border border-border rounded-xl p-3.5 flex-shrink-0">
              <SectionTitle>変更メモ</SectionTitle>
              <Textarea
                value={commitMsg}
                onChange={e => setCommitMsg(e.target.value)}
                placeholder="例: 表情アニメーションを追加、衣装マテリアルを調整　など"
                className="mb-2.5"
              />
              <div className="flex gap-2">
                <Button variant="primary" className="flex-1" onClick={handlePush}>
                  📤 保存して送信 (Push)
                </Button>
                <Button variant="secondary" onClick={handlePull}>
                  📥 取得 (Pull)
                </Button>
              </div>
            </div>
          </div>

          {/* 右カラム */}
          <div className="flex flex-col gap-3.5 overflow-y-auto min-h-0">
            <Card>
              <div className="text-[11px] font-bold text-text2 uppercase tracking-widest mb-3">
                📁 プロジェクト
              </div>
              <div className="bg-bg3 rounded-md px-2.5 py-1.5 font-mono text-[10px] text-text3 break-all mb-2.5">
                {config?.folder ?? '未設定'}
              </div>
              <Button variant="secondary" className="w-full text-[12px] py-1.5" onClick={onNavigateSetup}>
                設定を変更
              </Button>
            </Card>

            <Card>
              <div className="text-[11px] font-bold text-text2 uppercase tracking-widest mb-3">
                📋 最近の変更
              </div>
              {commits.length === 0 ? (
                <div className="text-[12px] text-text3">履歴なし</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {commits.slice(0, 4).map(c => (
                    <div key={c.hash} className="bg-bg3 rounded-lg px-3 py-2.5 border-l-[3px] border-accent">
                      <div className="text-[12px] text-text1 font-medium mb-1">{c.message}</div>
                      <div className="flex gap-2 text-[10px] text-text3">
                        <span className="font-mono text-cyan-400">{c.hash}</span>
                        <span>{fmtDate(c.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
