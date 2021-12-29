const { contextBridge, ipcRenderer } = require('electron');
const {
  openDirectoryDialog,
  example,
  readFile,
  downloadFile,
  initMysql,
  createModel,
  initProject,
  execCommand,
} = require('./channelList');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send(example, 'ping');
    },
    on(channel, func) {
      const validChannels = [
        openDirectoryDialog,
        example,
        readFile,
        downloadFile,
        initMysql,
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = [
        openDirectoryDialog,
        example,
        readFile,
        downloadFile,
        initMysql,
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
    /** 通过channel向主进程发送异步消息，可以发送任意参数。 */
    execTask: (taskName) => ipcRenderer.send(taskName),
    /** 如果你想从主进程中收到单个响应，比如一个方法调用的结果， 请考虑使用 ipcRenderer.invoke */
    execInvokeTask: async (taskName, ...args) => {
      return ipcRenderer.invoke(taskName, ...args);
    },
  },
  channel: {
    /**
     * 打开文件系统
     */
    openDirectoryDialog,
    readFile,
    downloadFile,
    initMysql,
    createModel,
    initProject,
    execCommand,
  },
});
