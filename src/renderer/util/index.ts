import { message } from 'antd';

/**
 * 选取文件夹
 * @returns directory url
 */
export const openDialog = async (
  options: Electron.OpenDialogSyncOptions = { properties: ['openDirectory'] }
): Promise<{ path: string; name?: string }> => {
  const result = await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.openDialog,
    options
  );
  if (result.code === 1) {
    throw Error(result.message);
  }
  return result.data;
};
/** 创建mysql链接 */
export const createMysqlConnection = async (
  db: CodeFaster.SqlConnection
): Promise<CodeFaster.SqlTable[]> => {
  const arg: CodeFaster.SqlTable[] =
    await window.electron.ipcRenderer.execInvokeTask(
      window.electron.channel.initMysql,
      db
    );
  return arg;
};

export const execNpmCommand = async (
  cmd: string,
  modules: string[]
): Promise<void> => {
  message.loading({
    content: '正在执行..',
    key: window.electron.channel.execCommand,
    duration: 0,
  });
  const arg = await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.execCommand,
    cmd,
    modules
  );
  message.destroy(window.electron.channel.execCommand);
  return arg;
};

export const createModel = async (
  project: CodeFaster.Project,
  model: CodeFaster.ModelForm
): Promise<void> => {
  await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.createModel,
    project,
    model
  );
};
export const initProject = async (
  project: CodeFaster.Project
): Promise<void> => {
  message.loading({
    content: '正在执行..',
    key: window.electron.channel.initProject,
    duration: 0,
  });
  await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.initProject,
    project
  );
  message.destroy(window.electron.channel.initProject);
};
export const generatorCURD = async (
  project: CodeFaster.Project,
  values: CodeFaster.CURDForm
): Promise<number> => {
  message.loading({
    content: '正在执行..',
    key: window.electron.channel.generatorCURD,
    duration: 0,
  });
  // 处理values pojo vo 实现 Table.java => Table
  const pojo = values.pojo.split('.')[0];
  values.pojo = pojo;
  const vo = values.vo.split('.')[0];
  values.vo = vo;
  const result: CodeFaster.Result<string> =
    await window.electron.ipcRenderer.execInvokeTask(
      window.electron.channel.generatorCURD,
      project,
      values
    );
  if (result.code === 1) {
    throw Error(result.message);
  }
  message.destroy(window.electron.channel.generatorCURD);
  return result.code;
};
/**
 * 重新生成项目配置文件
 * @param filePath 文件地址
 * @returns 文件流
 */
export const updateProjectConfig = async (
  project: CodeFaster.Project
): Promise<CodeFaster.ConfigJSON> => {
  const arg = await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.updateProjectConfig,
    project
  );
  return arg.data;
};
/**
 * 根据地址读取文件
 * @param filePath 文件地址
 * @returns 文件流
 */
export const readFile = async (filePath: string): Promise<string> => {
  const arg = await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.readFile,
    filePath
  );
  return arg;
};
export const getNodePath = async (
  cmd: 'basename' | 'dirname' | 'extname' | 'join' | 'normalize' | 'resolve',
  ...args: string[]
): Promise<string> => {
  const arg = await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.getNodePath,
    cmd,
    ...args
  );
  // eslint-disable-next-line no-nested-ternary
  return arg;
};

export const buildModelJson = async (
  model: CodeFaster.ModelForm
): Promise<void> => {
  message.loading({
    content: '正在执行..',
    key: window.electron.channel.initProject,
    duration: 0,
  });

  await window.electron.ipcRenderer
    .execInvokeTask(window.electron.channel.buildModelJson, model)
    .then((ele: { code: number; message: string }) => {
      if (ele.code === 1) {
        message.error(ele.message);
      }
      return ele;
    })
    .catch(console.log);
  message.destroy(window.electron.channel.initProject);
};

export const getApis = async (
  pathList: Array<CodeFaster.SearchJSON>
): Promise<Array<CodeFaster.ControllerApi>> => {
  const arg = await window.electron.ipcRenderer
    .execInvokeTask(window.electron.channel.getApis, pathList)
    .catch(console.log);
  if (arg.code === 1) {
    message.error(arg.message);
  }
  return arg.data;
};
