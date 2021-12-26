const mySql = (dataName: string, data: Array<any>, sql: Array<any>) => {
  const sqlArr: Array<any> = [];
  const TABLE_SPLIT_STR = 'CREATE TABLE IF NOT EXISTS ';
  const DIS_ID_STR = ' NULL DEFAULT NULL COMMENT ';
  const ID_STR = ' NOT NULL COMMENT ';
  const comment =
    'PRIMARY KEY (`id`), UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE) ENGINE = InnoDB COMMENT = ';
  data.forEach((item) => {
    const tableObj: any = {
      cloums: [],
      dbName: dataName,
      tableComment: item.TABLE_COMMENT,
      tableName: item.TABLE_NAME,
      // sql: table_split_str + '`' + dataName + '`.`' + item.TABLE_NAME + '` (',
      sql: `${TABLE_SPLIT_STR}${dataName}.${item.TABLE_NAME} (`,
    };
    sql.forEach((itm) => {
      const obj: any = {
        comment: '',
        name: '',
        type: '',
      };
      if (item.TABLE_NAME === itm.TABLE_NAME) {
        obj.comment = itm.COLUMN_COMMENT;
        obj.name = itm.COLUMN_NAME;
        // 处理字段类型
        if (
          itm.COLUMN_TYPE.toUpperCase().indexOf('BIGINT') >= 0 ||
          itm.COLUMN_TYPE.toUpperCase().indexOf('INTEGER') >= 0
        ) {
          obj.type = 'Long';
        } else if (
          itm.COLUMN_TYPE.toUpperCase().indexOf('INT') >= 0 ||
          itm.COLUMN_TYPE.toUpperCase().indexOf('TINYINT') >= 0
        ) {
          obj.type = 'Integer';
        } else if (
          itm.COLUMN_TYPE.toUpperCase().indexOf('VARCHAR') >= 0 ||
          itm.COLUMN_TYPE.toUpperCase().indexOf('TEXT') >= 0 ||
          itm.COLUMN_TYPE.toUpperCase().indexOf('CHAR') >= 0
        ) {
          obj.type = 'String';
        } else if (
          itm.COLUMN_TYPE.toUpperCase().indexOf('DATETIME') >= 0 ||
          itm.COLUMN_TYPE.toUpperCase().indexOf('DATE') >= 0 ||
          itm.COLUMN_TYPE.toUpperCase().indexOf('TIMESTAMP') >= 0
        ) {
          obj.type = 'Date';
        } else if (itm.COLUMN_TYPE.toUpperCase().indexOf('DOUBLE') >= 0) {
          obj.type = 'Double';
        } else if (itm.COLUMN_TYPE.toUpperCase().indexOf('FLOAT') >= 0) {
          obj.type = 'Float';
        } else if (itm.COLUMN_TYPE.toUpperCase().indexOf('BIT') >= 0) {
          obj.type = 'Boolean';
        } else if (itm.COLUMN_TYPE.toUpperCase().indexOf('DECIMAL') >= 0) {
          obj.type = 'BigDecimal';
        } else {
          obj.type = itm.COLUMN_TYPE.toUpperCase();
        }
        tableObj.cloums.push(obj);
      }
    });
    tableObj.cloums.forEach(
      (ele: { name: string; type: string; comment: string }) => {
        if (ele.name === 'id') {
          // tableObj.sql += " `" + ele.name + "` " + ele.type.toUpperCase() + id_str + "'" + ele.name + "', "
          tableObj.sql += `
           ' ${ele.name}' ${ele.type.toUpperCase()} ${ID_STR} '${ele.name}',
          `;
        } else {
          // tableObj.sql += "`" + ele.name + "` " + ele.type.toUpperCase() + dis_id_str + "'" + ele.comment + "', "
          tableObj.sql += `
            '${ele.name}' ${ele.type.toUpperCase()} ${DIS_ID_STR} '${
            ele.comment
          }',
          `;
        }
      }
    );
    tableObj.sql += item.TABLE_COMMENT
      ? comment + item.TABLE_COMMENT
      : comment + item.TABLE_NAME;
    sqlArr.push(tableObj);
  });
  return sqlArr;
};

module.exports = mySql;
