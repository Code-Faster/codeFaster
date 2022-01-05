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
export const createModel = async (
  model: CodeFaster.Model,
  project: CodeFaster.Project
): Promise<void> => {
  await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.createModel,
    model,
    project
  );
};
export const initProject = async (
  project: CodeFaster.Project
): Promise<void> => {
  await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.initProject,
    project
  );
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
  console.log(arg);
  return arg;
};

export const generatorCURD = async (
  templateName: string,
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
      templateName,
      project,
      values
    );
  if (result.code === 1) {
    throw Error(result.message);
  }
  message.destroy(window.electron.channel.generatorCURD);
  return result.code;
};
