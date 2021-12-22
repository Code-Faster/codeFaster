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

/** 项目表 */
interface Project {
  id?: number;
  /** 项目名称 */
  projectName?: string;
  /** 项目路径 */
  projectDir?: string;
  /** 作者 */
  owner?: string;
  /** 语言类型 1、Java 2、JavaScript */
  type?: number;
  /** 简介 */
  description?: string;
  /** 项目模版 */
  templateId?: number;
  createTime?: number;
  updateTime?: number;
}

/** 模版表 */
interface Template {
  id?: number;
  /** 模版名称 */
  templateName?: string;
  /** 项目路径 */
  templateDir?: string;
  /** 作者 */
  owner?: string;
  /** 语言类型 1、Java 2、JavaScript */
  type?: number;
  /** 简介 */
  description?: string;
  createTime?: number;
  updateTime?: number;
}
