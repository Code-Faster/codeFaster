/* eslint-disable @typescript-eslint/no-shadow */
import { spawn } from 'cross-spawn';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import {
  openDirectoryDialog,
  example,
  readFile,
  downloadFile,
  initMysql,
  createModel,
  initProject,
  execCommand,
} from './channelList';
import MysqlOpt from './mysql';
import Template from './template';

/** 模版地址 */
const playgroundPath = path.resolve(process.cwd(), 'playground');

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
 *
 * @param cmd install / update /remove
 * @param modules []
 * @param templateSourcePath
 * @returns
 */
const execCommandAction = (
  cmd: string,
  modules: string[],
  templateSourcePath: string
): Promise<any> => {
  return new Promise((resolve: any, reject: any): void => {
    // spawn的命令行参数是以数组形式传入
    // 此处将命令和要安装的插件以数组的形式拼接起来
    // 此处的cmd指的是执行的命令，比如install\uninstall\update
    const args = [cmd]
      .concat(modules)
      .concat('--color=always')
      .concat('--save');
    const npm = spawn('npm', args, { cwd: templateSourcePath }); // 执行npm，并通过 cwd指定执行的路径——配置文件所在文件夹
    let output = '';
    npm.stdout
      .on('data', (data: string) => {
        output += data; // 获取输出日志
      })
      .pipe(process.stdout);

    npm.stderr
      .on('data', (data: string) => {
        output += data; // 获取报错日志
      })
      .pipe(process.stderr);

    npm.on('close', (code: number) => {
      if (!code) {
        resolve({ code: 0, data: output }); // 如果没有报错就输出正常日志
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({ code, data: output }); // 如果报错就输出报错日志
      }
    });
  });
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
     * 初始化项目
     */
    ipcMain.handle(initProject, async (_event, project: Project) => {
      const template = new Template(project);
      return template.init();
    });
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
    /**
     * 执行npm命令
     */
    ipcMain.handle(
      execCommand,
      async (_event, cmd: string, modules: string[]) => {
        console.log(chalk.red(`__dirname == ${__dirname}`));
        return execCommandAction(cmd, modules, playgroundPath);
      }
    );
  }
}
