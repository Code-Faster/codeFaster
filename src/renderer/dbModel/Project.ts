import Dexie, { Table } from 'dexie';

class ProjectDatabase extends Dexie {
  projects!: Table<Project, number>; // id is number in this case

  public constructor() {
    super('ProjectDatabase');
    this.version(1).stores({
      projects:
        '++id,projectName,projectDir,owner,type,description,templateId,createTime,updateTime',
    });
  }
}
export default new ProjectDatabase();
