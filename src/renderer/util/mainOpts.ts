/**
 * 选取文件夹
 * @returns directory url
 */
const openDirectoryDialog = async (): Promise<string[] | any> => {
  const arg = await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.openDirectoryDialog
  );
  return arg && arg[0];
};
export default class FileOpts {
  static openDirectoryDialog = openDirectoryDialog;
}
