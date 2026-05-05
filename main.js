const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { execFile, exec } = require('child_process');

let mainWindow;

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
    backgroundColor: '#0f0f14',
    icon: path.join(__dirname, 'assets', 'icon.png'),
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IPC Handlers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ipcMain.handle('window-minimize', () => mainWindow.minimize());
ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.handle('window-close', () => mainWindow.close());

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Unityプロジェクトフォルダを選択',
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('save-config', async (_, config) => {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return true;
});

ipcMain.handle('load-config', async () => {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  if (!fs.existsSync(configPath)) return null;
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
});

// Git操作はシステムのgitコマンドを使用
function runGit(args, cwd) {
  return new Promise((resolve, reject) => {
    exec(`git ${args}`, { cwd, encoding: 'utf-8' }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve(stdout.trim());
    });
  });
}

ipcMain.handle('git-init', async (_, { folderPath, repoUrl, token, userName, userEmail }) => {
  try {
    const gitDir = path.join(folderPath, '.git');
    const isRepo = fs.existsSync(gitDir);

    if (!isRepo) {
      await runGit('init', folderPath);
    }

    // ユーザー設定
    await runGit(`config user.name "${userName || 'VRC Avatar User'}"`, folderPath);
    await runGit(`config user.email "${userEmail || 'user@example.com'}"`, folderPath);

    // .gitignoreの生成
    const gitignorePath = path.join(folderPath, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      const gitignoreContent = `# Unity生成ファイル
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
*.booproj
*.svd
*.DS_Store
*.csproj
*.unityproj
*.sln
*.suo
.vs/
ExportedObj/
.consulo/
*.csproj
*.unityproj
*.sln
*.suo
*.tmp
*.user
*.userprefs
crashlytics-build.properties
Assets/AssetStoreTools*

# 素材フォルダ（購入・配布素材）
Assets/ThirdParty/
Assets/VRCSDK/
Assets/Packages/
Assets/VRChat Examples/

# ただしmetaファイルは管理する
!Assets/ThirdParty/**/*.meta
!Assets/VRCSDK/**/*.meta
!Assets/Packages/**/*.meta
`;
      fs.writeFileSync(gitignorePath, gitignoreContent);
    }

    // リモート設定
    if (repoUrl) {
      const urlWithToken = repoUrl.replace('https://', `https://${token}@`);
      try {
        await runGit('remote remove origin', folderPath);
      } catch (e) {}
      await runGit(`remote add origin ${urlWithToken}`, folderPath);
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('git-status', async (_, { folderPath }) => {
  try {
    const output = await runGit('status --porcelain', folderPath);
    if (!output) return { success: true, files: [] };

    const files = output.split('\n').filter(Boolean).map(line => {
      const statusCode = line.substring(0, 2).trim();
      const filePath = line.substring(3);
      let status = 'modified';
      if (statusCode === '??') status = 'untracked';
      else if (statusCode === 'A') status = 'added';
      else if (statusCode === 'D') status = 'deleted';
      else if (statusCode === 'R') status = 'renamed';
      return { status, path: filePath };
    });

    return { success: true, files };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('git-log', async (_, { folderPath }) => {
  try {
    const output = await runGit('log --oneline -20 --pretty=format:"%H|%s|%ai|%an"', folderPath);
    if (!output) return { success: true, commits: [] };

    const commits = output.split('\n').filter(Boolean).map(line => {
      const [hash, message, date, author] = line.split('|');
      return { hash: hash?.substring(0, 7), message, date, author };
    });

    return { success: true, commits };
  } catch (e) {
    // コミットがない場合
    return { success: true, commits: [] };
  }
});

ipcMain.handle('git-commit-push', async (_, { folderPath, message, token }) => {
  try {
    await runGit('add -A', folderPath);

    // コミット
    await runGit(`commit -m "${message.replace(/"/g, '\\"')}"`, folderPath);

    // プッシュ
    await runGit('push -u origin main', folderPath);

    return { success: true };
  } catch (e) {
    // mainブランチがなければmasterで試す
    try {
      await runGit('push -u origin master', folderPath);
      return { success: true };
    } catch (e2) {
      return { success: false, error: e2.message };
    }
  }
});

ipcMain.handle('git-pull', async (_, { folderPath }) => {
  try {
    await runGit('pull', folderPath);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('check-git', async () => {
  return new Promise(resolve => {
    exec('git --version', (err, stdout) => {
      resolve({ installed: !err, version: stdout?.trim() });
    });
  });
});

ipcMain.handle('git-revert', async (_, { folderPath, hash, message }) => {
  try {
    // 未保存の変更があればスタッシュ（退避）してから戻す
    await runGit('stash', folderPath).catch(() => {});

    // 指定コミットの状態にハードリセット
    await runGit(`checkout ${hash} -- .`, folderPath);

    // 「元に戻した」というコミットを作成
    const safeMsg = (message || hash).replace(/"/g, '\\"');
    await runGit('add -A', folderPath);
    await runGit(`commit -m "⏪ 「${safeMsg}」の状態に戻した"`, folderPath);

    // プッシュ
    try {
      await runGit('push -u origin main', folderPath);
    } catch {
      await runGit('push -u origin master', folderPath);
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('open-external', (_, url) => shell.openExternal(url));
