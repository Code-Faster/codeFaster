import Dexie, { Table } from 'dexie';

class ProjectDatabase extends Dexie {
  projects!: Table<CodeFaster.Project, number>; // id is number in this case

  templates!: Table<CodeFaster.Template, number>; // id is number in this case

  sqlConnections!: Table<CodeFaster.SqlConnection, number>; // id is number in this case

  testFlows!: Table<CodeFaster.TestFlow, number>; // id is number in this case

  public constructor() {
    super('codeFaster');
    this.version(4).stores({
      projects:
        '++id,projectName,projectDir,owner,type,description,templateName,createTime,updateTime,defaultPojoPath,defaultVoPath,defaultServicePath,defaultServiceImplPath,testWebhook,prePublishWebhook,publishWebhook',
      templates:
        '++id,url,templateName,templateDir,owner,type,description,version,createTime,updateTime',
      sqlConnections:
        '++id,connectionName,dbType,host,user,password,database,port',
      testFlows: '++id,projectId,name,nodes,apiPath,apiOtherParams,state',
    });
  }
}
export default new ProjectDatabase();
