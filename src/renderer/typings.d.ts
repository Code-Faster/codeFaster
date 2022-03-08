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
  /** 搜索结果「下拉框使用」 */
  interface SearchJSON {
    // 下拉框label
    label: string;
    // 下拉框描述
    title: string;
    // 下拉框值
    value: string;
  }
  /** 测试流程表 */
  interface TestFlow {
    id?: number;
    // 项目ID
    projectId: number;
    // 流程名称
    name: string;
    // 流程节点
    nodes: FlowNode[];
    // 接口地址前缀
    apiPath: string;
    // 其他请求参数
    apiOtherParams: string;
    // 1、正常 2、失败
    state: number;
  }
  /** 测试流程节点 */
  interface FlowNode {
    // 表格唯一键
    id: number;
    // 节点参数列表
    params?: FlowParam[];
    // 节点关联的接口
    service?: ServiceApi;
    // 接口api地址
    serviceApi: string;
    // 接口api描述
    serviceText?: string;
  }
  /** 测试流程节点参数 */
  interface FlowParam {
    // 表格唯一键
    id: string;
    // 参数名
    name: string;
    // 参数描述
    value?: string;
    // 参数值
    data: string;
    // 数据类型
    dataType?: string;
    // 是否必传
    required: boolean;
    // 前置接口索引
    importApiIndex?: number;
    // 前置接口返回参数
    importApiResponse?: string;
  }
  /** 接口信息 */
  interface ServiceApi {
    api: string;
    //
    apiText: string;
    //
    requestMapping: string;
    //
    requestMappingText: string;
    //
    requestMappingType: string;
    //
    apiOperation: string;
    //
    apiOperationText: string;
    //
    postMapping: string;
    //
    getMapping: string;
    // 参数
    apiImplicitParamsText: Array<FlowParam>;
    //
    apiImplicitParams: string;
    //
    public: string;
  }
  /** controller对象 */
  interface ControllerApi {
    // 接口列表
    result: Array<ServiceApi>;
    //
    api: string;
    //
    apiText: string;
    //
    requestMapping: string;
    //
    requestMappingText: string;
    // 是否跳过测试
    isSkip: boolean;
    // Java类名
    className: string;
  }
  /**
   * 表SQL列对象
   */
  interface SqlColumn {
    columnComment: string;
    columnType: string;
    columnName: string;
  }
  /**
   * 表结构与pojo的双向json化
   */
  interface SqlTable {
    // 库名
    dbName: string;
    // 表名
    tableName: string;
    // 注释
    tableComment: string;
    // 表单字段数组
    tableCloums: SqlColumn[];
    // 表执行创建SQL
    tableSql: string;
  }
  /**
   * 生成模型的表单数据
   */
  interface ModelForm {
    buildPath: string;
    buildPathVo: string;
    buildJsonPath?: string;
    tableArray: SqlTable[];
  }
  /**
   * curd 的表单数据
   */
  interface CURDForm {
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
    /** 项目类型 1、Java【后台】 2、Admin【管理系统】 3、Web【含PC、H5、小程序】 4、App【Android、ios】 */
    type?: number;
    /** 简介 */
    description?: string;
    /** 项目模版名称，要唯一 */
    templateName: string;

    /** Java项目详细参数 */
    defaultPojoPath?: string;
    defaultVoPath?: string;
    defaultServicePath?: string;
    defaultServiceImplPath?: string;
    defaultControllerPath?: string;
    defaultMapperPath?: string;
    defaultUnitTestPath?: string;

    /** 部署相关信息 */
    testWebhook?: string;
    prePublishWebhook?: string;
    publishWebhook?: string;
  }

  interface JavaProject extends Project {
    /** Java项目详细参数 */
    defaultPojoPath?: string;
    defaultVoPath?: string;
    defaultServicePath?: string;
    defaultServiceImplPath?: string;
    defaultControllerPath?: string;
    defaultMapperPath?: string;
    defaultUnitTestPath?: string;
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

  /**
   * 项目配置文件cfconfig.json
   */
  type ConfigJSON = {
    fileName: string;
    path: string;
    // 拷贝项目使用
    fromPath?: string;
    /** 相对于项目根目录的地址 */
    sortPath: string;
    project?: CodeFaster.Project;
    // false 文件 true 文件夹
    isDir: boolean;
    children: Array<ConfigJSON>;
  };

  /**
   * 生成器参数
   */
  type Params = {
    /** 其他参数 */
    props: { [key: string]: any };
    /** 输出地址 */
    releasePath: string;
    model?: SqlTable;
  };

  /**
   * 代码生成器
   */
  interface CodeGenerator {
    /** 公用方法：初始化项目 */
    init: (params: CodeFaster.Params) => void;
    /** 公用方法：更新项目配置文件，并返回项目结构 */
    updateProjectConfig: () => CodeFaster.ConfigJSON | undefined;
  }
  /**
   * Java生成器，Java模版私有化方法
   */
  interface JavaCodeGenerator extends CodeGenerator {
    // 生成POJO
    generatorPojo: (params: CodeFaster.Params) => void;

    generatorVO: (params: CodeFaster.Params) => void;

    generatorService: (params: CodeFaster.Params) => void;

    generatorMapper: (params: CodeFaster.Params) => void;

    generatorController: (params: CodeFaster.Params) => void;

    generatorServiceImpl: (params: CodeFaster.Params) => void;

    generatorUnitTest: (params: CodeFaster.Params) => void;

    getModelByPojoPath: (filePath: string) => CodeFaster.SqlTable;
  }
  /**
   * Admin系统生成器
   */
  interface AdminCodeGenerator extends CodeGenerator {
    generatorPage: (params: CodeFaster.Params) => void;
  }

  /**
   * 返回结果结构类
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
