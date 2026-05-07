import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { existsSync, writeFileSync, readFileSync } from 'fs'
import { exec } from 'child_process'

let mainWindow: BrowserWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 750,
    minHeight: 580,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0c0c12',
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })

// ━━━ Git ━━━

function runGit(args: string, cwd: string, timeoutMs = 300000): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = exec(`git ${args}`, { cwd, encoding: 'utf-8' }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message))
      else resolve(stdout.trim())
    })
    const timer = setTimeout(() => {
      proc.kill()
      reject(new Error(`タイムアウト: git ${args}`))
    }, timeoutMs)
    proc.on('close', () => clearTimeout(timer))
  })
}

const runGitNet = (args: string, cwd: string) => runGit(args, cwd, 1800000)

// ━━━ IPC ━━━

ipcMain.handle('window-minimize', () => mainWindow.minimize())
ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize()
  else mainWindow.maximize()
})
ipcMain.handle('window-close', () => mainWindow.close())

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Unityプロジェクトフォルダを選択',
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('save-config', (_: Electron.IpcMainInvokeEvent, config: unknown) => {
  const configPath = join(app.getPath('userData'), 'config.json')
  writeFileSync(configPath, JSON.stringify(config, null, 2))
  return true
})

ipcMain.handle('load-config', () => {
  const configPath = join(app.getPath('userData'), 'config.json')
  if (!existsSync(configPath)) return null
  return JSON.parse(readFileSync(configPath, 'utf-8'))
})

ipcMain.handle('check-git', () =>
  new Promise(resolve => {
    exec('git --version', (err, stdout) => {
      resolve({ installed: !err, version: stdout?.trim() })
    })
  })
)

ipcMain.handle('git-init', async (_: Electron.IpcMainInvokeEvent, { folderPath, repoUrl, token, userName, userEmail }: {
  folderPath: string; repoUrl: string; token: string; userName: string; userEmail: string
}) => {
  try {
    const urlWithToken = repoUrl.replace('https://', `https://${token}@`)
    const isNewRepo = !existsSync(join(folderPath, '.git'))

    // グローバル設定
    await runGit(`config --global user.name "${userName || 'AvaTrace User'}"`, folderPath)
    await runGit(`config --global user.email "${userEmail || 'user@example.com'}"`, folderPath)
    await runGit('config --global core.autocrlf false', folderPath)

    if (isNewRepo) {
      // GitHubの推奨フローそのまま
      await runGit('init', folderPath)

      // .gitignore生成
      const gitignorePath = join(folderPath, '.gitignore')
      if (!existsSync(gitignorePath)) {
        writeFileSync(gitignorePath, GITIGNORE_TEMPLATE)
      }

      await runGit('add -A', folderPath)
      await runGit('commit -m "first commit"', folderPath)
      await runGit('branch -M main', folderPath)
      await runGit(`remote add origin ${urlWithToken}`, folderPath)
      await runGitNet('push -u origin main', folderPath)
    } else {
      // 既存リポジトリ
      const gitignorePath = join(folderPath, '.gitignore')
      if (!existsSync(gitignorePath)) {
        writeFileSync(gitignorePath, GITIGNORE_TEMPLATE)
      }
      try { await runGit('remote remove origin', folderPath) } catch {}
      await runGit(`remote add origin ${urlWithToken}`, folderPath)
      await runGit('branch -M main', folderPath).catch(() => {})
      await runGitNet('push -u origin main', folderPath).catch(() => {})
    }

    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message }
  }
})

ipcMain.handle('git-status', async (_: Electron.IpcMainInvokeEvent, { folderPath }: { folderPath: string }) => {
  try {
    const output = await runGit('status --porcelain', folderPath)
    if (!output) return { success: true, files: [] }
    const files = output.split('\n').filter(Boolean).map(line => {
      const code = line.substring(0, 2).trim()
      const path = line.substring(3)
      let status = 'modified'
      if (code === '??') status = 'untracked'
      else if (code === 'A') status = 'added'
      else if (code === 'D') status = 'deleted'
      else if (code === 'R') status = 'renamed'
      return { status, path }
    })
    return { success: true, files }
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message, files: [] }
  }
})

ipcMain.handle('git-log', async (_: Electron.IpcMainInvokeEvent, { folderPath }: { folderPath: string }) => {
  try {
    const output = await runGit('log --oneline -20 --pretty=format:"%H|%s|%ai|%an"', folderPath)
    if (!output) return { success: true, commits: [] }
    const commits = output.split('\n').filter(Boolean).map(line => {
      const [hash, message, date, author] = line.split('|')
      return { hash: hash?.substring(0, 7), message, date, author }
    })
    return { success: true, commits }
  } catch {
    return { success: true, commits: [] }
  }
})

ipcMain.handle('git-commit-push', async (_: Electron.IpcMainInvokeEvent, { folderPath, message }: {
  folderPath: string; message: string
}) => {
  try {
    await runGit('add -A', folderPath)
    await runGit(`commit -m "${message.replace(/"/g, '\\"')}"`, folderPath)
    await runGitNet('push -u origin main', folderPath)
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message }
  }
})

ipcMain.handle('git-pull', async (_: Electron.IpcMainInvokeEvent, { folderPath }: { folderPath: string }) => {
  try {
    await runGitNet('pull', folderPath)
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message }
  }
})

ipcMain.handle('git-check-sync', async (_: Electron.IpcMainInvokeEvent, { folderPath }: { folderPath: string }) => {
  try {
    await runGitNet('fetch origin', folderPath)
    const status = await runGit('status -sb', folderPath)
    const isDiverged = status.includes('diverged') || (status.includes('ahead') && status.includes('behind'))
    const isAhead = status.includes('ahead') && !status.includes('behind')
    const isBehind = status.includes('behind') && !status.includes('ahead')
    return { success: true, isDiverged, isAhead, isBehind }
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message, isDiverged: false, isAhead: false, isBehind: false }
  }
})

ipcMain.handle('git-resolve-local', async (_: Electron.IpcMainInvokeEvent, { folderPath }: { folderPath: string }) => {
  try {
    await runGitNet('push origin main --force', folderPath)
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message }
  }
})

ipcMain.handle('git-resolve-remote', async (_: Electron.IpcMainInvokeEvent, { folderPath }: { folderPath: string }) => {
  try {
    await runGit('reset --hard origin/main', folderPath)
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message }
  }
})

ipcMain.handle('git-revert', async (_: Electron.IpcMainInvokeEvent, { folderPath, hash }: {
  folderPath: string; hash: string; message: string
}) => {
  try {
    // 復元前の状態を自動バックアップ
    await runGit('add -A', folderPath).catch(() => {})
    const status = await runGit('status --porcelain', folderPath).catch(() => '')
    if (status) {
      const now = new Date().toLocaleString('ja-JP', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
      await runGit(`commit -m "backup: 復元前の自動バックアップ (${now})"`, folderPath)
    }
    await runGit(`reset --hard ${hash}`, folderPath)
    await runGit('clean -fd', folderPath).catch(() => {})
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message }
  }
})

ipcMain.handle('git-revert-push', async (_: Electron.IpcMainInvokeEvent, { folderPath, message, hash }: {
  folderPath: string; message: string; hash: string
}) => {
  try {
    const safeMsg = (message || hash).replace(/"/g, '\\"')
    await runGit('add -A', folderPath).catch(() => {})
    const status = await runGit('status --porcelain', folderPath).catch(() => '')
    if (status) {
      await runGit(`commit -m "revert: ${safeMsg} の状態に戻した"`, folderPath)
    }
    await runGitNet('push origin HEAD:main --force', folderPath)
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message }
  }
})

ipcMain.handle('open-external', (_: Electron.IpcMainInvokeEvent, url: string) =>
  shell.openExternal(url)
)

// ━━━ .gitignore テンプレート ━━━
const GITIGNORE_TEMPLATE = `# Unity生成ファイル
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/
[Bb]uilds/
[Ll]ogs/
[Uu]ser[Ss]ettings/
*.pidb
*.pdb
*.mdb
*.suo
*.tmp
*.user
*.userprefs
*.DS_Store
*.csproj
*.unityproj
*.sln
.vs/
ExportedObj/
Assets/AssetStoreTools*

# Assetsフォルダ全体を除外（購入素材・配布素材）
Assets/

# Packages
Packages/
!Packages/manifest.json
!Packages/packages-lock.json
`
