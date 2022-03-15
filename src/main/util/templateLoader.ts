/* eslint-disable global-require */
import path from 'path';
import fs from 'fs-extra';
import resolve from 'resolve';
import util from '.';

/** 模版所在目录 */
export const PLAYGROUND_PATH = path.resolve(
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'
    ? path.join(__dirname, '../../../playground/')
    : path.join(__dirname, '../../../../playground/')
);

export default class TemplateLoader {
  /** 模版基础目录 */
  private basePath: string;

  /** 模版node_models目录 */
  private modulesDir: string;

  /** package.json文件 */
  private packagePath: string;

  /** 模版列表 */
  private list: string[] = [];

  constructor() {
    this.basePath = PLAYGROUND_PATH;
    this.modulesDir = path.join(PLAYGROUND_PATH, 'node_modules/');
    this.packagePath = path.join(PLAYGROUND_PATH, 'package.json');
    util.Logger.success('The template loader starts 模版加载器启动！');
    util.Logger.info(`__dirname=${__dirname}`);
    util.Logger.info(`PLAYGROUND_PATH=${PLAYGROUND_PATH}`);
  }

  init() {
    const json = fs.readJSONSync(this.packagePath); // 读取package.json
    const deps = Object.keys(json.dependencies || {});
    const devDeps = Object.keys(json.devDependencies || {});
    // 1.获取插件列表
    const modules = deps.concat(devDeps).filter((name: string) => {
      if (!/^codefaster-|^@[^/]+\/codefaster-/.test(name)) return false;
      const templatePath = this.resolvePlugin(name); // 获取模版路径
      return fs.existsSync(templatePath);
    });
    modules.forEach((ele: string) => {
      this.list.push(ele);
    });
    return this;
  }

  resolvePlugin(name: string): string {
    // 获取插件路径
    try {
      return resolve.sync(name, { basedir: this.basePath });
    } catch (err) {
      return path.join(this.basePath, 'node_modules', name);
    }
  }

  getPlugin(name: string) {
    util.Logger.success(name);
    util.Logger.success(this.modulesDir);
    const pathStr = path.join(this.modulesDir, name);
    // 通过插件名获取插件
    util.Logger.success(pathStr);
    // eslint-disable-next-line import/no-dynamic-require
    const result = require(pathStr);
    util.Logger.info(`对象${result}`);
    return result;
  }
}
