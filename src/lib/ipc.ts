// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { ipcRenderer } = (window as any).require('electron')

import type {
  AppConfig,
  GitResult,
  StatusResult,
  LogResult,
  GitCheckResult,
  SyncCheckResult,
} from '../types'

export const ipc = {
  // ウィンドウ操作
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),

  // フォルダ選択
  selectFolder: (): Promise<string | null> =>
    ipcRenderer.invoke('select-folder'),

  // 設定
  saveConfig: (config: AppConfig): Promise<boolean> =>
    ipcRenderer.invoke('save-config', config),
  loadConfig: (): Promise<AppConfig | null> =>
    ipcRenderer.invoke('load-config'),

  // Git操作
  gitInit: (params: {
    folderPath: string
    repoUrl: string
    token: string
    userName: string
    userEmail: string
  }): Promise<GitResult> => ipcRenderer.invoke('git-init', params),

  gitStatus: (folderPath: string): Promise<StatusResult> =>
    ipcRenderer.invoke('git-status', { folderPath }),

  gitLog: (folderPath: string): Promise<LogResult> =>
    ipcRenderer.invoke('git-log', { folderPath }),

  gitCommitPush: (params: {
    folderPath: string
    message: string
    token: string
  }): Promise<GitResult> => ipcRenderer.invoke('git-commit-push', params),

  gitPull: (folderPath: string): Promise<GitResult> =>
    ipcRenderer.invoke('git-pull', { folderPath }),

  gitCheckSync: (folderPath: string): Promise<SyncCheckResult> =>
    ipcRenderer.invoke('git-check-sync', { folderPath }),

  gitResolveLocal: (folderPath: string): Promise<GitResult> =>
    ipcRenderer.invoke('git-resolve-local', { folderPath }),

  gitResolveRemote: (folderPath: string): Promise<GitResult> =>
    ipcRenderer.invoke('git-resolve-remote', { folderPath }),

  gitRevert: (params: {
    folderPath: string
    hash: string
    message: string
  }): Promise<GitResult> => ipcRenderer.invoke('git-revert', params),

  gitRevertPush: (params: {
    folderPath: string
    hash: string
    message: string
  }): Promise<GitResult> => ipcRenderer.invoke('git-revert-push', params),

  checkGit: (): Promise<GitCheckResult> => ipcRenderer.invoke('check-git'),

  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('open-external', url),
}
