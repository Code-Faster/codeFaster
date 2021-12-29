/**
 * 选取文件夹
 * @returns directory url
 */
export const openDirectoryDialog = async (): Promise<string> => {
  const arg = await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.openDirectoryDialog
  );
  return arg && arg[0];
};
export const createModel = async (
  model: Model,
  project: Project
): Promise<void> => {
  await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.createModel,
    model,
    project
  );
};
export const initProject = async (project: Project): Promise<void> => {
  await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.initProject,
    project
  );
};
export const execNpmCommand = async (
  cmd: string,
  modules: string[]
): Promise<void> => {
  const arg = await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.execCommand,
    cmd,
    modules
  );
  return arg;
};

export default class PreloadUtil {
  electron = window.electron;

  getElectron() {
    return this.electron;
  }
}
