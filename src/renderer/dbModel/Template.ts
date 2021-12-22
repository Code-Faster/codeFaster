/* eslint-disable promise/always-return */
import Dexie, { Table } from 'dexie';

class TemplateDatabase extends Dexie {
  templates!: Table<Template, number>; // id is number in this case

  public constructor() {
    super('TemplateDatabase');
    this.version(1).stores({
      templates:
        '++id,templateName,templateDir,owner,type,description,createTime,updateTime',
    });
  }
}
export default new TemplateDatabase();
