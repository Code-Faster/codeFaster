const mysql = require('mysql2');

class MysqlOpt {
  public pool;

  constructor(sqlConnction: CodeFaster.SqlConnection) {
    // 创建一个数据库连接
    this.pool = mysql.createPool(sqlConnction);
  }

  query(sqlStr: string): Promise<unknown> {
    const res = new Promise((resolve) => {
      this.pool.query(sqlStr, (error: any, results: unknown) => {
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
