import { useState, useCallback } from 'react'
import { ipc } from '../lib/ipc'
import type { AppConfig, ChangedFile, Commit } from '../types'

export function useGit(config: AppConfig | null) {
  const [files, setFiles] = useState<ChangedFile[]>([])
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('処理中...')

  const showLoading = (text: string) => {
    setLoadingText(text)
    setLoading(true)
  }
  const hideLoading = () => setLoading(false)

  const refreshStatus = useCallback(async () => {
    if (!config?.folder) return
    const result = await ipc.gitStatus(config.folder)
    if (result.success) setFiles(result.files)
  }, [config])

  const refreshLog = useCallback(async () => {
    if (!config?.folder) return
    const result = await ipc.gitLog(config.folder)
    if (result.success) setCommits(result.commits)
  }, [config])

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshStatus(), refreshLog()])
  }, [refreshStatus, refreshLog])

  const commitAndPush = useCallback(
    async (message: string): Promise<string | null> => {
      if (!config) return 'プロジェクトが設定されていません'
      showLoading('GitHubに送信中...')
      const result = await ipc.gitCommitPush({
        folderPath: config.folder,
        message,
        token: config.token,
      })
      hideLoading()
      if (result.success) {
        await refreshAll()
        return null
      }
      return result.error ?? '不明なエラー'
    },
    [config, refreshAll]
  )

  const pull = useCallback(async (): Promise<string | null> => {
    if (!config) return 'プロジェクトが設定されていません'
    showLoading('最新データを取得中...')
    const result = await ipc.gitPull(config.folder)
    hideLoading()
    if (result.success) {
      await refreshAll()
      return null
    }
    return result.error ?? '不明なエラー'
  }, [config, refreshAll])

  const revertLocal = useCallback(
    async (hash: string, message: string): Promise<string | null> => {
      if (!config) return 'プロジェクトが設定されていません'
      showLoading('ローカルを復元中...')
      const result = await ipc.gitRevert({ folderPath: config.folder, hash, message })
      hideLoading()
      if (result.success) {
        await refreshAll()
        return null
      }
      return result.error ?? '不明なエラー'
    },
    [config, refreshAll]
  )

  const revertPush = useCallback(
    async (hash: string, message: string): Promise<string | null> => {
      if (!config) return 'プロジェクトが設定されていません'
      showLoading('GitHubに反映中...')
      const result = await ipc.gitRevertPush({ folderPath: config.folder, hash, message })
      hideLoading()
      if (result.success) {
        await refreshAll()
        return null
      }
      return result.error ?? '不明なエラー'
    },
    [config, refreshAll]
  )

  return {
    files,
    commits,
    loading,
    loadingText,
    refreshStatus,
    refreshLog,
    refreshAll,
    commitAndPush,
    pull,
    revertLocal,
    revertPush,
  }
}
