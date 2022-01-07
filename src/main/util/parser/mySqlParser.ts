const mySql = (dataName: string, data: Array<any>, sql: Array<any>) => {
  const resultList: Array<CodeFaster.SqlTable> = [];
  const TABLE_SPLIT_STR = 'CREATE TABLE IF NOT EXISTS ';
  const DIS_ID_STR = ' NULL DEFAULT NULL COMMENT ';
  const ID_STR = ' NOT NULL COMMENT ';
  const comment =
    'PRIMARY KEY (`id`), UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE) ENGINE = InnoDB COMMENT = ';
  data.forEach((item) => {
    const tableObj: CodeFaster.SqlTable = {
      tableCloums: [],
      dbName: dataName,
      tableComment: item.TABLE_COMMENT,
      tableName: item.TABLE_NAME,
      tableSql: `${TABLE_SPLIT_STR}${dataName}.${item.TABLE_NAME} (`,
    };
    sql.forEach((e) => {
      const obj: CodeFaster.SqlColumn = {
        columnComment: '',
        columnName: '',
        columnType: '',
      };
      if (item.TABLE_NAME === e.TABLE_NAME) {
        obj.columnComment = e.COLUMN_COMMENT;
        obj.columnName = e.COLUMN_NAME;
        // 处理字段类型
        if (
          e.COLUMN_TYPE.toUpperCase().indexOf('BIGINT') >= 0 ||
          e.COLUMN_TYPE.toUpperCase().indexOf('INTEGER') >= 0
        ) {
          obj.columnType = 'Long';
        } else if (
          e.COLUMN_TYPE.toUpperCase().indexOf('INT') >= 0 ||
          e.COLUMN_TYPE.toUpperCase().indexOf('TINYINT') >= 0
        ) {
          obj.columnType = 'Integer';
        } else if (
          e.COLUMN_TYPE.toUpperCase().indexOf('VARCHAR') >= 0 ||
          e.COLUMN_TYPE.toUpperCase().indexOf('TEXT') >= 0 ||
          e.COLUMN_TYPE.toUpperCase().indexOf('CHAR') >= 0
        ) {
          obj.columnType = 'String';
        } else if (
          e.COLUMN_TYPE.toUpperCase().indexOf('DATETIME') >= 0 ||
          e.COLUMN_TYPE.toUpperCase().indexOf('DATE') >= 0 ||
          e.COLUMN_TYPE.toUpperCase().indexOf('TIMESTAMP') >= 0
        ) {
          obj.columnType = 'Date';
        } else if (e.COLUMN_TYPE.toUpperCase().indexOf('DOUBLE') >= 0) {
          obj.columnType = 'Double';
        } else if (e.COLUMN_TYPE.toUpperCase().indexOf('FLOAT') >= 0) {
          obj.columnType = 'Float';
        } else if (e.COLUMN_TYPE.toUpperCase().indexOf('BIT') >= 0) {
          obj.columnType = 'Boolean';
        } else if (e.COLUMN_TYPE.toUpperCase().indexOf('DECIMAL') >= 0) {
          obj.columnType = 'BigDecimal';
        } else {
          obj.columnType = e.COLUMN_TYPE.toUpperCase();
        }
        tableObj.tableCloums.push(obj);
      }
    });
    tableObj.tableCloums.forEach((ele: CodeFaster.SqlColumn) => {
      if (ele.columnName === 'id') {
        tableObj.tableSql += `
           ' ${ele.columnName}' ${ele.columnType.toUpperCase()} ${ID_STR} '${
          ele.columnName
        }',
          `;
      } else {
        tableObj.tableSql += `
            '${
              ele.columnName
            }' ${ele.columnType.toUpperCase()} ${DIS_ID_STR} '${
          ele.columnComment
        }',
          `;
      }
    });
    tableObj.tableSql += item.TABLE_COMMENT
      ? comment + item.TABLE_COMMENT
      : comment + item.TABLE_NAME;
    resultList.push(tableObj);
  });
  return resultList;
};

module.exports = mySql;
