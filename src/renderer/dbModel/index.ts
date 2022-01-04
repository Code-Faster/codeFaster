import Dexie, { Table } from 'dexie';

class ProjectDatabase extends Dexie {
  projects!: Table<Project, number>; // id is number in this case

  templates!: Table<Template, number>; // id is number in this case

  sqlConnections!: Table<SqlConnection, number>; // id is number in this case

  public constructor() {
    super('codeFaster');
    this.version(1).stores({
      projects:
        '++id,projectName,projectDir,owner,type,description,templateId,createTime,updateTime,defaultPojoPath,defaultVoPath,defaultServicePath,defaultServiceImplPath',
    });
    this.version(1).stores({
      templates:
        '++id,url,templateName,templateDir,owner,type,description,version,createTime,updateTime',
    });
    this.version(1).stores({
      sqlConnections:
        '++id,connectionName,dbType,host,user,password,database,port',
    });
  }
}
export default new ProjectDatabase();
