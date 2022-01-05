/* eslint-disable global-require */
import path from 'path';
import fs from 'fs-extra';
import resolve from 'resolve';
import chalk from 'chalk';

/** 模版所在目录 */
export const PLAYGROUND_PATH = path.resolve(
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'
    ? path.join(__dirname, '../../playground/')
    : path.join(__dirname, '../../playground/')
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
    console.log(chalk.green('模版加载器启动！'), PLAYGROUND_PATH);
    this.basePath = PLAYGROUND_PATH;
    this.modulesDir = path.join(PLAYGROUND_PATH, 'node_modules/');
    this.packagePath = path.join(PLAYGROUND_PATH, 'package.json');
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
    // 通过插件名获取插件
    // eslint-disable-next-line import/no-dynamic-require
    return require(this.modulesDir + name);
  }
}
