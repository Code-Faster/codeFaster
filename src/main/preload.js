const { contextBridge, ipcRenderer } = require('electron');
const { openDirectoryDialog, example } = require('./task');
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send(example, 'ping');
    },
    on(channel, func) {
      const validChannels = [openDirectoryDialog, example];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = [openDirectoryDialog, example];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
    execTask: (taskName) => ipcRenderer.send(taskName),
  },
  task: {
    /**
     * 打开文件系统
     */
    openDirectoryDialog: openDirectoryDialog,
  },
});
