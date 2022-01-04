declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

interface Window {
  electron: { [key: string]: any };
}

declare namespace Npm {
  export interface Links {
    npm: string;
    homepage: string;
    repository: string;
    bugs: string;
  }

  export interface Author {
    name: string;
    email: string;
    username: string;
  }

  export interface Publisher {
    username: string;
    email: string;
  }

  export interface Maintainer {
    username: string;
    email: string;
  }

  export interface Package {
    name: string;
    scope: string;
    version: string;
    description: string;
    keywords: string[];
    date: Date;
    links: Links;
    author: Author;
    publisher: Publisher;
    maintainers: Maintainer[];
    hasInstall: boolean;
  }

  export interface Flags {
    unstable: boolean;
  }

  export interface Detail {
    quality: number;
    popularity: number;
    maintenance: number;
  }

  export interface Score {
    final: number;
    detail: Detail;
  }

  export interface WapperObject {
    package: Package;
    flags: Flags;
    score: Score;
    searchScore: number;
  }

  export interface NpmTemplateResult {
    objects: WapperObject[];
    total: number;
    time: string;
  }
}

declare namespace CodeFaster {
  /**
   * 模型生成器
   */
  export interface Model {
    /** 表名 */
    tableName: string;
    /** 表注释 */
    tableCnName: string;
    /** 列名 */
    tableColArr: Array<{ [key: string]: any }>;
  }
  export interface CURDForm {
    pojo: string;
    vo: string;
    pojoPath: string;
    voPath: string;
    servicePath: string;
    serviceImplPath: string;
    controllerPath: string;
    unitTestPath: string;
    mapperPath: string;
  }

  /** 项目表 */
  interface Project {
    id?: number;
    /** 项目名称 */
    projectName: string;
    /** 项目路径 */
    projectDir: string;
    /** 作者 */
    owner?: string;
    /** 语言类型 1、Java 2、JavaScript */
    type?: number;
    /** 简介 */
    description?: string;
    /** 项目模版 */
    templateId?: number;
    /** 模版ID对应的物理地址 */
    templateDir: string;

    /** Java项目详细参数 */
    defaultPojoPath?: string;
    defaultVoPath?: string;
    defaultServicePath?: string;
    defaultServiceImplPath?: string;
  }

  /** 模版表 */
  interface Template {
    id?: number;
    /** 模版下载地址 */
    url: string;
    /** 模版名称 */
    templateName: string;
    /** 作者 */
    owner?: string;
    /** 语言类型 1、java 2、javaScript */
    type: number;
    /** 简介 */
    description?: string;
    version?: string;
    createTime?: number;
    updateTime?: number;
  }

  /**
   * 数据库 链接表
   */
  interface SqlConnection {
    id?: number;
    // 数据库昵称
    connectionName: string;
    // 数据库类型 1 mysql 2 oracle 3 mongodb
    dbType: number;
    // 链接地址
    host: string;
    // 数据库用户名
    user: string;
    // 数据库密码
    password: string;
    // 数据库表名
    database: string;
    // 端口号
    port: number;
  }

  type FileParams = {
    url: string;
    fileName: string;
    fileType: string;
  };

  type FileObj = {
    fileName: string;
    path: string;
    fromPath?: string;
    formData?: CodeFaster.Model;
    // false 文件 true 文件夹
    isDir: boolean;
    children: Array<FileObj>;
  };

  /**
   * 生成器参数
   */
  type Params = {
    /** 其他参数 */
    props: { [key: string]: any };
    /** 输出地址 */
    releasePath: string;
    model?: Model;
  };

  interface CodeGenerator {
    init: (params: CodeFaster.Params) => void;

    generatorPojo: (params: CodeFaster.Params) => void;

    generatorVO: (params: CodeFaster.Params) => void;

    generatorService: (params: CodeFaster.Params) => void;

    generatorMapper: (params: CodeFaster.Params) => void;

    generatorController: (params: CodeFaster.Params) => void;

    generatorServiceImpl: (params: CodeFaster.Params) => void;

    generatorUnitTest: (params: CodeFaster.Params) => void;

    getModelByPojoPath: (filePath: string) => CodeFaster.Model;
  }

  /**
   * 结构类
   */
  type Result<T> = {
    /** 0、 成功 1、失败 */
    code: 0 | 1;
    /** 返回的消息 */
    message?: string;
    /** 返回的数据 */
    data?: T;
  };
}
