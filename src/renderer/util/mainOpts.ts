/**
 * 选取文件夹
 * @returns directory url
 */
const openDirectoryDialog = async (): Promise<string> => {
  const arg = await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.openDirectoryDialog
  );
  return arg && arg[0];
};
const createModel = async (model: Model, project: Project): Promise<void> => {
  await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.createModel,
    model,
    project
  );
};
/**
 * 连接main层与render层
 */
export default class MainOpts {
  static openDirectoryDialog = openDirectoryDialog;

  static createModel = createModel;
}
