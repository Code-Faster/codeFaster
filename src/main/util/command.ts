import { spawn } from 'cross-spawn';
/**
 *
 * @param cmd install / update /remove
 * @param modules []
 * @param templateSourcePath
 * @returns
 */
const execCommand = (
  cmd: string,
  modules: string[],
  where: string,
  env: { [key: string]: string } = {}
): Promise<any> => {
  return new Promise((resolve: any, reject: any): void => {
    // spawn的命令行参数是以数组形式传入
    // 此处将命令和要安装的插件以数组的形式拼接起来
    // 此处的cmd指的是执行的命令，比如install\uninstall\update
    const args = [cmd]
      .concat(modules)
      .concat('--color=always')
      .concat('--save');
    const npm = spawn('npm', args, {
      cwd: where,
      env: { ...process.env, ...env },
    }); // 执行npm，并通过 cwd指定执行的路径——配置文件所在文件夹
    let output = '';
    npm.stdout
      .on('data', (data: string) => {
        output += data; // 获取输出日志
      })
      .pipe(process.stdout);

    npm.stderr
      .on('data', (data: string) => {
        output += data; // 获取报错日志
      })
      .pipe(process.stderr);

    npm.on('close', (code: number) => {
      if (!code) {
        resolve({ code: 0, data: output }); // 如果没有报错就输出正常日志
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({ code: 1, data: output }); // 如果报错就输出报错日志
      }
    });
    npm.on('error', (err: Error) => {
      throw err;
    });
  });
};
export default execCommand;
