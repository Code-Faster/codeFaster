import { dialog, ipcMain } from 'electron';
import { openDirectoryDialog, example } from './channelList';
/**
 * 与preload.js 事件相对应
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export default class ipcHandler {
  static init() {
    ipcMain.on(example, async (event, arg) => {
      const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
      event.reply(example, msgTemplate('pong'));
    });
    ipcMain.handle(openDirectoryDialog, async (event, arg) => {
      const result = await dialog.showOpenDialogSync({
        properties: ['openDirectory'],
      });
      return result;
    });
  }
}
