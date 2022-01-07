import mysql, { Connection } from 'mysql';

class MysqlOpt {
  public connection: Connection;

  constructor(sqlConnction: CodeFaster.SqlConnection) {
    this.connection = mysql.createConnection(sqlConnction);
    this.connection.connect();
  }

  query(sqlStr: string): Promise<unknown> {
    const res = new Promise((resolve) => {
      this.connection.query(sqlStr, (error, results) => {
        if (error) throw error;
        resolve(results);
      });
    });
    return res;
  }
}
/**
 * mysql 操作类
 */
export default MysqlOpt;
