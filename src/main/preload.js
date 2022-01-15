const { contextBridge, ipcRenderer } = require('electron');
const list = require('./channelList');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on(channel, func) {
      const validChannels = [...list];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = [...list];
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
    ...list,
  },
});
