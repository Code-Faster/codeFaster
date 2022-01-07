import chalk from 'chalk';

const getNowTime = (): string => {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()} `;
};

export default class Logger {
  static loglist: string[] = [];

  static error(message: string) {
    if (message === undefined) {
      throw Error('缺少消息主体参数');
    }
    this.push(message);
    console.error(chalk.red(`${getNowTime()}[${message}]`));
  }

  static info(message: string) {
    if (message === undefined) {
      throw Error('缺少消息主体参数');
    }
    this.push(message);
    console.log(`${getNowTime()}[${message}]`);
  }

  static success(message: string) {
    if (message === undefined) {
      throw Error('缺少消息主体参数');
    }
    this.push(message);
    console.log(chalk.green(`${getNowTime()}[${message}]`));
  }

  static remove() {
    this.loglist = [];
  }

  static push(message: string) {
    this.loglist.push(message);
  }
}
