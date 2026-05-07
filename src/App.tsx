import { useState, useEffect, useCallback } from 'react'
import type { AppConfig, PanelId } from './types'
import { ipc } from './lib/ipc'
import { useGit } from './hooks/useGit'
import { useToast } from './hooks/useToast'
import { TitleBar } from './components/TitleBar'
import { Sidebar } from './components/Sidebar'
import { MainPanel } from './components/MainPanel'
import { HistoryPanel } from './components/HistoryPanel'
import { SetupPanel } from './components/SetupPanel'
import { GuidePanel } from './components/GuidePanel'
import { ConflictPanel } from './components/ConflictPanel'
import { LoadingOverlay, ToastContainer } from './components/ui'

export default function App() {
  const [activePanel, setActivePanel] = useState<PanelId>('main')
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [gitInstalled, setGitInstalled] = useState(true)
  const [showConflict, setShowConflict] = useState(false)

  const { toasts, toast } = useToast()
  const git = useGit(config)

  // 初期化
  useEffect(() => {
    const init = async () => {
      const gitCheck = await ipc.checkGit()
      setGitInstalled(gitCheck.installed)
      if (!gitCheck.installed) { setActivePanel('setup'); return }

      const cfg = await ipc.loadConfig()
      if (cfg) {
        setConfig(cfg)
      } else {
        setActivePanel('setup')
      }
    }
    init()
  }, [])

  // config変化時にデータ取得
  useEffect(() => {
    if (config) git.refreshAll()
  }, [config])

  const handleSaveConfig = useCallback(
    async (newConfig: AppConfig): Promise<string | null> => {
      const result = await ipc.gitInit({
        folderPath: newConfig.folder,
        repoUrl: newConfig.repoUrl,
        token: newConfig.token,
        userName: newConfig.userName,
        userEmail: newConfig.userEmail,
      })
      if (!result.success) return result.error ?? '不明なエラー'

      await ipc.saveConfig(newConfig)
      setConfig(newConfig)
      setActivePanel('main')
      return null
    },
    []
  )

  return (
    <div className="h-screen flex flex-col bg-bg text-text1 overflow-hidden font-sans">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePanel={activePanel}
          onNavigate={setActivePanel}
          connected={!!config?.repoUrl}
        />
        <main className="flex-1 flex overflow-hidden bg-bg">
          {activePanel === 'main' && (
            <MainPanel
              config={config}
              files={git.files}
              commits={git.commits}
              onRefreshStatus={git.refreshStatus}
              onCommitPush={git.commitAndPush}
              onPull={async () => {
              const syncResult = await git.checkSync()
              if (syncResult?.isDiverged) {
                setShowConflict(true)
                return null
              }
              return git.pull()
            }}
              onNavigateSetup={() => setActivePanel('setup')}
              onToast={toast}
            />
          )}
          {activePanel === 'history' && (
            <HistoryPanel
              commits={git.commits}
              onRevertLocal={git.revertLocal}
              onRevertPush={git.revertPush}
              onToast={toast}
            />
          )}
          {activePanel === 'setup' && (
            <SetupPanel
              config={config}
              gitInstalled={gitInstalled}
              onSave={handleSaveConfig}
              onToast={toast}
            />
          )}
          {activePanel === 'guide' && <GuidePanel />}
        </main>
      </div>

      {git.loading && <LoadingOverlay text={git.loadingText} />}
      {showConflict && config && (
        <ConflictPanel
          folderPath={config.folder}
          onResolveLocal={git.resolveLocal}
          onResolveRemote={git.resolveRemote}
          onToast={toast}
          onClose={() => setShowConflict(false)}
        />
      )}
      <ToastContainer toasts={toasts} />
    </div>
  )
}
