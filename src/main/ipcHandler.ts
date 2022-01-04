/* eslint-disable @typescript-eslint/no-shadow */
import { spawn } from 'cross-spawn';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import {
  openDialog,
  example,
  readFile,
  initMysql,
  createModel,
  initProject,
  execCommand,
  generatorCURD,
} from './channelList';
import MysqlOpt from './mysql';
import Template from './template';
import TemplateLoader, { PLAYGROUND_PATH } from './templateLoader';

const fileReader = (filePath: string): string => {
  const stats = fs.statSync(filePath);
  if (stats.isFile()) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  throw new Error('传入的参数必须为文件地址');
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
  private templateLoader: TemplateLoader;

  constructor() {
    // 执行模版加载器
    this.templateLoader = new TemplateLoader().init();
  }

  init(win: BrowserWindow) {
    // 执行通信模块
    ipcMain.on(example, async (event, _arg) => {
      const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
      event.reply(example, msgTemplate('pong'));
    });

    /**
     * 选择文件/文件夹对话框, 不允许多选
     */
    ipcMain.handle(
      openDialog,
      async (
        _event,
        options: Electron.OpenDialogSyncOptions
      ): Promise<
        CodeFaster.Result<{ name: string | undefined; path: string }>
      > => {
        try {
          if (options.properties) {
            options.properties = options.properties.filter((ele) => {
              return ele !== 'multiSelections';
            });
          }
          const result = dialog.showOpenDialogSync(options);
          if (result === undefined) return await new Promise(() => {});

          return {
            code: 0,
            data: {
              name: path.resolve(result[0]).split(path.sep).pop(),
              path: result[0],
            },
          };
        } catch (error: any) {
          return { code: 1, message: error.stack || error.message };
        }
      }
    );

    /**
     * 根据文件地址读取文件
     * @param filePath
     */
    ipcMain.handle(readFile, async (_event, arg: string) => {
      return fileReader(arg);
    });

    ipcMain.handle(
      initMysql,
      async (_event, args: CodeFaster.SqlConnection, sqlStr: string) => {
        const c = new MysqlOpt(args);
        const result = await c.query(sqlStr);
        return result;
      }
    );
    /**
     * 初始化项目
     */
    ipcMain.handle(
      initProject,
      async (_event, _templateName: string, project: CodeFaster.Project) => {
        const GeneratorFactory = this.templateLoader.getPlugin(_templateName);
        const codeGenerator: CodeFaster.CodeGenerator = new GeneratorFactory(
          project
        );
        codeGenerator.init({
          /** 其他参数 */
          props: {},
          /** 输出地址 */
          releasePath: project.projectDir,
        });
      }
    );
    /**
     * 生成pojo模型
     */
    ipcMain.handle(
      createModel,
      async (
        _event,
        model: CodeFaster.Model,
        project: CodeFaster.Project
      ): Promise<CodeFaster.Result<string>> => {
        const template = new Template(project);
        template.generatorPOJO(model);
        return { code: 0 };
      }
    );
    /**
     * 执行npm命令
     */
    ipcMain.handle(
      execCommand,
      async (_event, cmd: string, modules: string[]) => {
        console.log(chalk.green(`PLAYGROUND_PATH == ${PLAYGROUND_PATH}`));
        return execCommandAction(cmd, modules, PLAYGROUND_PATH);
      }
    );

    /**
     * 执行templateLoader命令
     */
    ipcMain.handle(
      generatorCURD,
      async (
        _event,
        _templateName: string,
        project: CodeFaster.Project,
        params: CodeFaster.CURDForm
      ): Promise<CodeFaster.Result<string>> => {
        try {
          const GeneratorFactory = this.templateLoader.getPlugin(_templateName);
          const codeGenerator: CodeFaster.CodeGenerator = new GeneratorFactory(
            project
          );
          const pojoJSON = codeGenerator.getModelByPojoPath(params.pojoPath);
          codeGenerator.generatorService({
            /** 其他参数 */
            props: params,
            /** 输出地址 */
            releasePath: params.servicePath,
            model: pojoJSON,
          });
          codeGenerator.generatorServiceImpl({
            /** 其他参数 */
            props: params,
            /** 输出地址 */
            releasePath: params.serviceImplPath,
            model: pojoJSON,
          });
          codeGenerator.generatorController({
            /** 其他参数 */
            props: params,
            /** 输出地址 */
            releasePath: params.controllerPath,
            model: pojoJSON,
          });
          codeGenerator.generatorMapper({
            /** 其他参数 */
            props: params,
            /** 输出地址 */
            releasePath: params.mapperPath,
            model: pojoJSON,
          });
          codeGenerator.generatorUnitTest({
            /** 其他参数 */
            props: params,
            /** 输出地址 */
            releasePath: params.unitTestPath,
            model: pojoJSON,
          });
          return { code: 0 };
        } catch (error: any) {
          return { code: 1, message: error.stack || error.message };
        }
      }
    );
  }
}
