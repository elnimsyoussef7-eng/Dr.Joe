const { app, BrowserWindow, globalShortcut, clipboard, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// ── Firebase Admin SDK for server-side user management ──
let adminAuth = null;
try {
  const admin = require('firebase-admin');
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    adminAuth = admin.auth();
    console.log('[Main] Firebase Admin SDK initialized successfully.');
  } else {
    console.warn('[Main] serviceAccountKey.json not found — Admin user deletion disabled.');
    console.warn('[Main] Download it from: https://console.firebase.google.com/project/dr-joe-for-sat/settings/serviceaccounts/adminsdk');
  }
} catch (err) {
  console.error('[Main] Failed to initialize Firebase Admin SDK:', err.message);
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Dr. Joe For SAT',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools only in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  // On macOS, recreate window if dock icon is clicked and no windows are open
  if (mainWindow === null || mainWindow.isDestroyed()) {
    createWindow();
  }
});

// IPC handlers for kiosk mode
ipcMain.on('enter-kiosk', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setKiosk(true);
    mainWindow.webContents.closeDevTools();
    globalShortcut.register('Alt+Tab', () => {});
    globalShortcut.register('PrintScreen', () => {});
    clipboard.clear();
  }
});

ipcMain.on('exit-kiosk', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
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

// ── IPC handler: Delete a user from Firebase Auth via Admin SDK ──
ipcMain.handle('delete-auth-user', async (event, uid) => {
  if (!adminAuth) {
    return { success: false, error: 'Firebase Admin SDK not initialized. Place serviceAccountKey.json in the app folder.' };
  }
  try {
    await adminAuth.deleteUser(uid);
    console.log('[Main] Successfully deleted Auth user:', uid);
    return { success: true };
  } catch (err) {
    console.error('[Main] Error deleting Auth user:', uid, err.message);
    // If user already deleted from Auth, treat as success
    if (err.code === 'auth/user-not-found') {
      return { success: true, note: 'User was already removed from Auth.' };
    }
    return { success: false, error: err.message };
  }
});
