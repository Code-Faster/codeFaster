import parser from './parser/index';

/** 创建链接 */
const queryConnection = async (
  db: SqlConnection,
  sqlStr: string
): Promise<unknown> => {
  const arg = await window.electron.ipcRenderer.execInvokeTask(
    window.electron.channel.initMysql,
    db,
    sqlStr
  );
  return arg;
};
/**
 * mysql 创建链接
 * @param db mysql 链接参数
 */
const createMysqlConnection = async (db: SqlConnection) => {
  const data = await queryConnection(
    db,
    `select table_name,table_comment from information_schema.tables where table_schema='${db.database}'`
  );
  const sql = await queryConnection(
    db,
    `select TABLE_SCHEMA ,TABLE_NAME,COLUMN_NAME,ORDINAL_POSITION,COLUMN_DEFAULT,IS_NULLABLE,DATA_TYPE,CHARACTER_MAXIMUM_LENGTH,NUMERIC_PRECISION,NUMERIC_SCALE,COLUMN_TYPE,COLUMN_KEY 'KEY',EXTRA,COLUMN_COMMENT from information_schema.COLUMNS where table_schema='${db.database}' ORDER BY TABLE_NAME, ORDINAL_POSITION`
  );
  const results = parser.mySqlParser(db.database, data, sql);
  return results;
};

export default class DbOpts {
  static createMysqlConnection = createMysqlConnection;
}
