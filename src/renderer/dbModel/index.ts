import Dexie, { Table } from 'dexie';

class ProjectDatabase extends Dexie {
  projects!: Table<Project, number>; // id is number in this case

  templates!: Table<Template, number>; // id is number in this case

  sqlConnections!: Table<SqlConnection, number>; // id is number in this case

  public constructor() {
    super('code-faster');
    this.version(1).stores({
      projects:
        '++id,projectName,projectDir,owner,type,description,templateId,createTime,updateTime',
    });
    this.version(1).stores({
      templates:
        '++id,templateName,templateDir,owner,type,description,createTime,updateTime',
    });
    this.version(4).stores({
      sqlConnections:
        '++id,connectionName,dbType,host,user,password,database,port',
    });
  }
}
export default new ProjectDatabase();
