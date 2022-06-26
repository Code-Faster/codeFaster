/* eslint-disable global-require */
import path, { dirname } from 'path';
import fs from 'fs-extra';
import resolve from 'resolve';
import util from '.';
import fileOpt from './fileOpt';
import Module from 'module';

const vm = require('vm');
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
    if (name === undefined) {
      util.Logger.error(`name can not be undefined`);
      throw new Error('name can not be undefined');
    }
    const templateTopPath = path.join(this.modulesDir, name);
    const packageJsonPath = path.join(templateTopPath, 'package.json');
    const packagejson = fileOpt.fileReader(packageJsonPath);
    const templateReleasePath = path.join(
      templateTopPath,
      JSON.parse(packagejson).main
    );
    // 通过插件名获取插件
    util.Logger.success(templateTopPath);
    // const result = await import(pathStr);
    const result = this.load(templateReleasePath);
    // const result = require(templateTopPath);
    return result;
  }

  load(filePath: string) {
    console.log('templateReleasePath', filePath);
    let script = fileOpt.fileReader(filePath);
    const module = new Module(filePath);
    module.filename = filePath;
    module.paths = Module._nodeModulePaths(filePath);

    function req(_path: string) {
      return module.require(_path);
    }

    req.resolve = (request: any) => Module._resolveFilename(request, module);

    req.main = require.main;
    req.cache = Module._cache;

    script = `(function(exports, require, module, __filename, __dirname, cf){${script};return module.exports;\n});`;

    const compiledWrapper = vm.runInThisContext(script, {
      filePath,
      lineOffset: 0,
      displayErrors: true,
    });

    const result = compiledWrapper(
      module.exports,
      req,
      module,
      filePath,
      dirname(filePath),
      this
    );

    console.log('compiledWrapper', result);

    return result;
  }
}
