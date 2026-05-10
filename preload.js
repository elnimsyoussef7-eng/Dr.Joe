const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  enterKiosk: () => ipcRenderer.send('enter-kiosk'),
  exitKiosk: () => ipcRenderer.send('exit-kiosk'),
  disableShortcuts: () => ipcRenderer.send('disable-shortcuts'),
  clearClipboard: () => ipcRenderer.send('clear-clipboard'),
  deleteAuthUser: (uid) => ipcRenderer.invoke('delete-auth-user', uid)
});
