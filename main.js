const { app, BrowserWindow, globalShortcut, clipboard, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC handlers for kiosk mode
ipcMain.on('enter-kiosk', () => {
  if (mainWindow) {
    mainWindow.setKiosk(true);
    mainWindow.webContents.closeDevTools();
    globalShortcut.register('Alt+Tab', () => {});
    globalShortcut.register('PrintScreen', () => {});
    clipboard.clear();
  }
});

ipcMain.on('exit-kiosk', () => {
  if (mainWindow) {
    mainWindow.setKiosk(false);
    globalShortcut.unregister('Alt+Tab');
    globalShortcut.unregister('PrintScreen');
  }
});

ipcMain.on('disable-shortcuts', () => {
  globalShortcut.register('Alt+Tab', () => {});
  globalShortcut.register('PrintScreen', () => {});
});

ipcMain.on('clear-clipboard', () => {
  clipboard.clear();
});
