/* eslint-disable @typescript-eslint/no-shadow */
import { dialog, ipcMain, Notification } from 'electron';
import fs from 'fs';
import path from 'path';
import {
  openDialog,
  example,
  readFile,
  initMysql,
  createModel,
  initProject,
  execCommand,
  generatorCURD,
  getLoggerList,
} from './channelList';
import TemplateLoader, { PLAYGROUND_PATH } from './util/templateLoader';
import util from './util';
import parser from './util/parser';

/** 显示系统提示 */
export const showMessage = (body: string, subtitle?: string) => {
  const notification = new Notification({
    title: '系统提示',
    body,
    subtitle,
  });
  notification.show();
};
const fileReader = (filePath: string): string => {
  const stats = fs.statSync(filePath);
  if (stats.isFile()) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  throw new Error('传入的参数必须为文件地址');
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
    util.Logger.success('事件通信启动！');
  }

  init() {
    // 执行通信模块
    ipcMain.on(example, async (event) => {
      const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
      event.reply(example, msgTemplate('pong'));
    });

    // 获取执行日志
    ipcMain.handle(getLoggerList, async () => {
      return util.Logger.loglist;
    });

    /**
     * 执行npm命令
     */
    ipcMain.handle(
      execCommand,
      async (_event, cmd: string, modules: string[]) => {
        util.Logger.info(`PLAYGROUND_PATH=${PLAYGROUND_PATH}`);
        util.Logger.info(`npm ${cmd} ${modules.toString()}`);
        const result = await util.execCommand(cmd, modules, PLAYGROUND_PATH);
        showMessage('命令执行成功');
        return result;
      }
    );
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

    /**
     * 执行SQL链接
     */
    ipcMain.handle(
      initMysql,
      async (
        _event,
        db: CodeFaster.SqlConnection
      ): Promise<CodeFaster.SqlTable[]> => {
        const c = new util.Mysql(db);
        const data = await c.query(
          `select table_name,table_comment from information_schema.tables where table_schema='${db.database}'`
        );
        const sql = await c.query(
          `select TABLE_SCHEMA ,TABLE_NAME,COLUMN_NAME,ORDINAL_POSITION,COLUMN_DEFAULT,IS_NULLABLE,DATA_TYPE,CHARACTER_MAXIMUM_LENGTH,NUMERIC_PRECISION,NUMERIC_SCALE,COLUMN_TYPE,COLUMN_KEY 'KEY',EXTRA,COLUMN_COMMENT from information_schema.COLUMNS where table_schema='${db.database}' ORDER BY TABLE_NAME, ORDINAL_POSITION`
        );
        return parser.mySqlParser(db.database, data, sql);
      }
    );
    /**
     * 初始化项目
     */
    ipcMain.handle(
      initProject,
      async (
        _event,
        _templateName: string,
        project: CodeFaster.Project
      ): Promise<CodeFaster.Result<string>> => {
        try {
          const GeneratorFactory = this.templateLoader.getPlugin(_templateName);
          const codeGenerator: CodeFaster.JavaCodeGenerator =
            new GeneratorFactory(project);
          codeGenerator.init({
            /** 其他参数 */
            props: {},
            /** 输出地址 */
            releasePath: project.projectDir,
          });
          util.Logger.success('初始化项目执行成功');
          return { code: 0 };
        } catch (error: any) {
          return { code: 1, message: error.stack || error.message };
        }
      }
    );
    /**
     * 生成pojo模型
     */
    ipcMain.handle(
      createModel,
      async (
        _event,
        _templateName,
        project: CodeFaster.Project,
        model: CodeFaster.ModelForm
      ): Promise<CodeFaster.Result<string>> => {
        try {
          const GeneratorFactory = this.templateLoader.getPlugin(_templateName);
          const codeGenerator: CodeFaster.JavaCodeGenerator =
            new GeneratorFactory(project);
          model.tableArray.forEach((ele: CodeFaster.SqlTable) => {
            codeGenerator.generatorPojo({
              /** 其他参数 */
              props: {},
              /** 输出地址 */
              releasePath: model.buildPath,
              model: ele,
            });
            util.Logger.success(`${ele.tableName} - generatorPojo执行成功`);
            codeGenerator.generatorVO({
              /** 其他参数 */
              props: {},
              /** 输出地址 */
              releasePath: model.buildPathVo,
              model: ele,
            });
            util.Logger.success(`${ele.tableName} - generatorVO执行成功`);
          });

          return { code: 0 };
        } catch (error: any) {
          return { code: 1, message: error.stack || error.message };
        }
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
          const codeGenerator: CodeFaster.JavaCodeGenerator =
            new GeneratorFactory(project);
          const pojoJSON = codeGenerator.getModelByPojoPath(params.pojoPath);
          codeGenerator.generatorService({
            /** 其他参数 */
            props: params,
            /** 输出地址 */
            releasePath: params.servicePath,
            model: pojoJSON,
          });
          util.Logger.success('generatorService执行成功');
          codeGenerator.generatorServiceImpl({
            /** 其他参数 */
            props: params,
            /** 输出地址 */
            releasePath: params.serviceImplPath,
            model: pojoJSON,
          });
          util.Logger.success('generatorServiceImpl执行成功');
          codeGenerator.generatorController({
            /** 其他参数 */
            props: params,
            /** 输出地址 */
            releasePath: params.controllerPath,
            model: pojoJSON,
          });
          util.Logger.success('generatorController执行成功');
          codeGenerator.generatorMapper({
            /** 其他参数 */
            props: params,
            /** 输出地址 */
            releasePath: params.mapperPath,
            model: pojoJSON,
          });
          util.Logger.success('generatorMapper执行成功');
          codeGenerator.generatorUnitTest({
            /** 其他参数 */
            props: params,
            /** 输出地址 */
            releasePath: params.unitTestPath,
            model: pojoJSON,
          });
          util.Logger.success('generatorUnitTest执行成功');
          return { code: 0 };
        } catch (error: any) {
          return { code: 1, message: error.stack || error.message };
        }
      }
    );
  }
}
