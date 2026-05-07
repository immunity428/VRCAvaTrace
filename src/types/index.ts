export type FileStatus = 'modified' | 'added' | 'deleted' | 'untracked' | 'renamed'

export interface ChangedFile {
  status: FileStatus
  path: string
}

export interface Commit {
  hash: string
  message: string
  date: string
  author: string
}

export interface AppConfig {
  folder: string
  repoUrl: string
  token: string
  userName: string
  userEmail: string
}

export type PanelId = 'main' | 'history' | 'setup' | 'guide'

export interface GitResult {
  success: boolean
  error?: string
}

export interface StatusResult extends GitResult {
  files: ChangedFile[]
}

export interface LogResult extends GitResult {
  commits: Commit[]
}

export interface GitCheckResult {
  installed: boolean
  version?: string
}
