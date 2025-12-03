const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (e) {
  // electron-squirrel-startup not available in dev
}

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let detachableWindow;
let diffWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hidden',
    frame: false,
    show: false,
    backgroundColor: '#F3F3F2',
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:3001');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

ipcMain.on('open-detachable-window', () => {
  if (detachableWindow) {
    detachableWindow.focus();
    return;
  }

  detachableWindow = new BrowserWindow({
    width: 520,
    height: 67,
    frame: false,
    transparent: true,
    resizable: true,
    useContentSize: true,
    minWidth: 520,
    maxWidth: 520,
    minHeight: 67,
    maxHeight: 1200,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  detachableWindow.loadFile(path.join(__dirname, '../additional ui elements/detacheble-window.html'));
  detachableWindow.setOpacity(1.0);

  detachableWindow.on('closed', () => {
    detachableWindow = null;
  });
});

ipcMain.on('close-detachable-window', () => {
  if (detachableWindow) {
    detachableWindow.close();
  }
});

ipcMain.on('resize-detachable-window', (event, { width, height }) => {
  if (detachableWindow) {
    detachableWindow.setContentSize(width, height, true);
  }
});

// Open diff window from detachable window
ipcMain.on('open-diff-window', () => {
  if (diffWindow) {
    diffWindow.focus();
    return;
  }

  diffWindow = new BrowserWindow({
    width: 1050,
    height: 650,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  diffWindow.loadFile(path.join(__dirname, '../additional ui elements/diff.html'));

  diffWindow.on('closed', () => {
    diffWindow = null;
  });
});

ipcMain.on('close-diff-window', () => {
  if (diffWindow) {
    diffWindow.close();
  }
});

ipcMain.on('minimize-diff-window', () => {
  if (diffWindow) {
    diffWindow.minimize();
  }
});

ipcMain.on('maximize-diff-window', () => {
  if (diffWindow) {
    if (diffWindow.isMaximized()) {
      diffWindow.unmaximize();
    } else {
      diffWindow.maximize();
    }
  }
});

ipcMain.on('diff-results', (event, results) => {
  // Handle the results from the diff window
  console.log('Diff results received:', results);
  // You can forward these results to the main window or process them here
});

// End session: close detachable window and open diff window
ipcMain.on('end-session-and-show-diff', () => {
  // Close detachable window
  if (detachableWindow) {
    detachableWindow.close();
    detachableWindow = null;
  }

  // Open diff window
  if (diffWindow) {
    diffWindow.focus();
    return;
  }

  diffWindow = new BrowserWindow({
    width: 1050,
    height: 650,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  diffWindow.loadFile(path.join(__dirname, '../additional ui elements/diff.html'));

  diffWindow.on('closed', () => {
    diffWindow = null;
  });
});

// Show main window (called from diff window after accept/reject)
ipcMain.on('show-main-window', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

// Main window controls
ipcMain.on('minimize-main-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-main-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-main-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create a window when dock icon is clicked and no windows open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
