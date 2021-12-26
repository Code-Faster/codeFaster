/* eslint-disable @typescript-eslint/no-shadow */
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import {
  openDirectoryDialog,
  example,
  readFile,
  downloadFile,
  initMysql,
  createModel,
} from './channelList';
import MysqlOpt from './mysql';
import Template from './template';

const fileReader = (filePath: string): string => {
  const stats = fs.statSync(filePath);
  if (stats.isFile()) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  throw new Error('传入的参数必须为文件地址');
};
/**
 *  description: 下载文件到指定目录
 *  param {string} url 文件下载链接
 *  param {string} fileName 文件名称
 *  param {string} fileType 文件格式
 *  author: longyunfei
 */
const downloadFileToFolder = (
  win: BrowserWindow,
  url: string,
  fileName: string,
  fileType: string
) => {
  win.webContents.downloadURL(url);
  win.webContents.session.once(
    'will-download',
    (_event, item, _webContents) => {
      // 设置保存路径
      const filePath = path.join(
        app.getAppPath(),
        '/download',
        `${fileName}.${fileType}`
      );
      item.setSavePath(filePath);
      item.on('updated', (_event, state) => {
        if (state === 'interrupted') {
          console.log('下载中断，可以继续');
        } else if (state === 'progressing') {
          if (item.isPaused()) {
            console.log('下载暂停');
          } else {
            console.log(`当前下载项目的接收字节${item.getReceivedBytes()}`);
            console.log(
              `下载完成百分比：${
                (item.getReceivedBytes() / item.getTotalBytes()) * 100
              }`
            );
          }
        }
      });
      item.once('done', (_event, state) => {
        if (state === 'completed') {
          // 打开文件
          shell.openPath(filePath);
        }
      });
    }
  );
};
/**
 * 与preload.js 事件相对应
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export default class ipcHandler {
  static init(win: BrowserWindow) {
    ipcMain.on(example, async (event, _arg) => {
      const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
      event.reply(example, msgTemplate('pong'));
    });
    ipcMain.handle(openDirectoryDialog, async () => {
      const result = await dialog.showOpenDialogSync({
        properties: ['openDirectory'],
      });
      console.log(result);
      return result;
    });
    /**
     * 根据文件地址读取文件
     * @param filePath
     */
    ipcMain.handle(readFile, async (_event, arg: string) => {
      return fileReader(arg);
    });

    ipcMain.handle(downloadFile, async (_event, args: FileParams) => {
      return downloadFileToFolder(win, args.url, args.fileName, args.fileType);
    });

    ipcMain.handle(
      initMysql,
      async (_event, args: SqlConnection, sqlStr: string) => {
        const c = new MysqlOpt(args);
        const result = await c.query(sqlStr);
        return result;
      }
    );
    /**
     * 生成pojo模型
     */
    ipcMain.handle(
      createModel,
      async (_event, model: Model, project: Project) => {
        const template = new Template(project);
        return template.generatorPOJO(model);
      }
    );
  }
}
