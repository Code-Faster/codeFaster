import path from 'path';
import fs from 'fs';

const JAVA_SUFFIX = '.java';
const TEMPLATE_JSON = 'code-faster.json';
const EXCLUDE_PATH = [
  'node_modules',
  'target',
  'bin',
  '.settings',
  'logs',
  '.project',
  '.factorypath',
  '.classpath',
  '.apt_generated',
  '.git',
  '.idea',
  '.gitignore',
  'yarn.lock',
  'yarn-error.log',
  'README.md',
];
/**
 * 根据 _ 生成驼峰 , type 默认true 首字母大写,如果没有 _ 分隔符 , 则取第一个大写
 * @param {*} str
 */
const tranformHumpStr = (str: string, type = true): string => {
  if (str.length === 0) {
    return '';
  }
  if (str.indexOf('_') >= 0) {
    let strArr = str.split('_');
    strArr = strArr.map((ele) => {
      return ele.charAt(0).toUpperCase() + ele.substring(1).toLowerCase();
    });
    const result = strArr.join('');
    return type ? result : result.charAt(0).toLowerCase() + result.substring(1);
  }
  return type
    ? str.charAt(0).toUpperCase() + str.substring(1).toLowerCase()
    : str;
};
/**
 * 根据文件路径获取包名
 * @param filePath 文件路径
 * @param startFix 包名前缀
 */
const getPackageName = (filePath: string, startFix: string) => {
  if (filePath.length === 0 || startFix.length === 0) {
    throw new Error('缺少参数!');
  }
  const fileObj = path.parse(filePath);
  const filePathArr = path.join(fileObj.dir, fileObj.name).split(path.sep);
  return filePathArr
    .filter((_ele: unknown, index: number) => {
      return index >= filePathArr.indexOf(startFix);
    })
    .join('.');
};

/**
 * 模版生成类
 */
export default class Template {
  private project: Project = {
    owner: '',
    templateId: 0,
    templateDir: '',
    projectDir: '',
    projectName: '',
    type: 1,
    description: '',
  };

  private keyPathArr: Array<any> = [];

  // 项目最终路径
  private projectPath: string = '';

  // 静态目录模版目录名
  private templateModelName: string = 'createTemplate';

  constructor(pj: Project) {
    this.project = pj;
    this.keyPathArr = [];
    this.projectPath = path.join(pj.projectDir, pj.projectName);
    console.log(this.projectPath);
  }

  /** 执行初始化  */
  public init() {
    // 1、获取目录结构
    const structure = this.showStructure(this.project);
    // 2、生成结构目录文件
    this.getStructure(
      structure,
      structure.fileName,
      this.project.projectName,
      this.project.projectDir
    );
    // 3、将模版修改后输出到产出目录
    this.copyCoding(structure);
    // 4、将生成的目录文件copy到输出目录项目下
    fs.writeFileSync(
      path.join(
        path.join(this.project.projectDir, this.project.projectName),
        TEMPLATE_JSON
      ),
      JSON.stringify(structure)
    );
  }

  /**
   * 替换目录结构参数
   * @param structure
   * @param formProjectName
   * @param projectName
   * @param buildPath
   */
  getStructure(
    structure: FileObj,
    formProjectName: string,
    projectName: string,
    buildPath: string
  ) {
    structure.fileName = structure.fileName.replaceAll(
      formProjectName,
      projectName
    );
    // 处理window 系统 路径\\
    if (structure.path.indexOf('\\') >= 0) {
      structure.path = structure.path
        .replaceAll(
          this.project.templateDir
            .substring(0, this.project.templateDir.lastIndexOf('\\'))
            .replaceAll('\\\\', '\\\\'),
          buildPath
        )
        .replaceAll(formProjectName, projectName);
    } else if (structure.path.indexOf('/') >= 0) {
      structure.path = structure.path
        .replaceAll(
          this.project.templateDir.substr(
            0,
            this.project.templateDir.lastIndexOf('/')
          ),
          buildPath
        )
        .replaceAll(formProjectName, projectName);
    }
    if (structure.children.length > 0) {
      structure.children.forEach((obj: any) => {
        if (obj.path.indexOf('\\') >= 0) {
          obj.path = obj.path
            .replaceAll(
              this.project.templateDir
                .substring(0, this.project.templateDir.lastIndexOf('\\'))
                .replaceAll('\\\\', '\\\\'),
              buildPath
            )
            .replaceAll(formProjectName, projectName);
        } else if (obj.path.indexOf('/') >= 0) {
          obj.path = obj.path
            .replaceAll(
              this.project.templateDir.substring(
                0,
                this.project.templateDir.lastIndexOf('/')
              ),
              buildPath
            )
            .replaceAll(formProjectName, projectName);
        }
        this.getStructure(obj, formProjectName, projectName, buildPath);
      });
    }
  }

  /**
   * 拷贝模版代码，复制模版代码，内部做关键字替换
   * @param structure
   */
  copyCoding(structure: FileObj) {
    if (!fs.existsSync(structure.path)) {
      fs.mkdirSync(structure.path);
    }
    if (structure.isDir) {
      if (structure.children.length > 0) {
        // 如果是文件夹
        structure.children.forEach((obj: FileObj) => {
          // 如果子目录是dir
          if (obj.isDir) this.copyCoding(obj);
          else {
            const data = fs.readFileSync(obj.fromPath || '', 'utf8');
            const result = data.replace(
              new RegExp(this.templateModelName, 'g'),
              this.project.projectName
            );
            fs.writeFileSync(obj.path, result, 'utf8');
          }
        });
      }
    } else {
      // 如果不是文件夹
      const data = fs.readFileSync(structure.fromPath || '', 'utf8');
      const result = data.replace(
        new RegExp(this.templateModelName, 'g'),
        this.project.projectName
      );
      fs.writeFileSync(structure.path, result, 'utf8');
    }
  }

  /**
   * 根据关键字获取文件夹
   * @param key
   * @param type 搜索文件夹 还是 文件 默认0 :文件夹 1: 文件 2、模糊搜索文件
   */
  findByKey(key: string, type: number) {
    // 置空
    this.keyPathArr = [];
    const jsonData: FileObj = this.getJsonFromPath();
    this.getModelsStructure(jsonData, key, type);
    return this.keyPathArr;
  }

  /**
   * 获取文件路径简称
   * @param file_path 目录下的文件路径
   */
  pathToLable(file_path: string) {
    return file_path.replaceAll(
      this.projectPath.substring(0, this.projectPath.lastIndexOf('/') + 1),
      ''
    );
  }

  /**
   * 根据文档结构json 迭代出匹配关键字地址
   * @param jsonData 目录结构json
   * @param key   关键字
   * @param type 搜索文件夹 还是 文件 默认0 :文件夹 1: 文件 2、模糊搜索文件
   */
  getModelsStructure(jsonData: FileObj, key: string, type: number) {
    // 如果是文件夹
    if (jsonData.isDir) {
      if (jsonData.fileName === key && type === 0) {
        this.keyPathArr.push({
          label: this.pathToLable(jsonData.path),
          value: jsonData.path,
          children: jsonData.children,
        });
      }
      // 如果还有子文件, 递归执行
      if (jsonData.children.length > 0) {
        jsonData.children.forEach((obj: FileObj) => {
          this.getModelsStructure(obj, key, type);
        });
      }
    } else {
      // 如果搜索文件
      if (type === 1 && jsonData.fileName === key) {
        this.keyPathArr.push({
          label: this.pathToLable(jsonData.path),
          value: jsonData.path,
        });
      }
      if (type === 2 && jsonData.fileName.includes(key)) {
        this.keyPathArr.push({
          label: this.pathToLable(jsonData.path),
          value: jsonData.path,
        });
      }
    }
  }

  /**
   * 根据文件转化json结构
   * @param isUpdate 是否强制更新文件
   * @param filePath 如果强制更新，是否指定读取更新文件地址
   */
  getJsonFromPath = (isUpdate?: boolean, filePath?: string): FileObj => {
    let dirPath = path.join(this.projectPath, TEMPLATE_JSON);
    // 如果导入的时候指定文件
    if (filePath) {
      dirPath = filePath;
    }
    const stats = fs.statSync(dirPath);
    if (stats.isFile()) {
      const jsonData: FileObj = JSON.parse(fs.readFileSync(dirPath, 'utf-8'));
      // 处理项目文件目录
      if (isUpdate) {
        // 重新生成
        jsonData.path = path.parse(dirPath).dir;
        if (jsonData.formData && jsonData.formData !== undefined) {
          // buildPath 去除项目名称
          const arr = path.parse(dirPath).dir.split(path.sep);
          arr.pop();
          jsonData.formData.buildPath = arr.join(path.sep);
        }
        return this.showStructure(jsonData.formData, jsonData);
      }
      return jsonData;
    }
    throw Error('文件地址格式不正确！');
  };

  /**
   * 遍历文件目录结构
   * @param fileObj
   */
  fileDisplay(fileObj: FileObj) {
    // 根据文件路径读取文件，返回文件列表
    const files = fs.readdirSync(fileObj.path);
    // 遍历读取到的文件列表
    files.forEach((fileName) => {
      // 获取当前文件的绝对路径
      const filedir = path.join(fileObj.path, fileName);
      // 根据文件路径获取文件信息，返回一个fs.Stats对象
      const stats = fs.statSync(filedir);
      const isFile = stats.isFile(); // 是文件
      const isDir = stats.isDirectory(); // 是文件夹
      const isExcludeFlag = EXCLUDE_PATH.filter((ele) => {
        return filedir.indexOf(ele) >= 0;
      });
      if (isExcludeFlag.length > 0) {
        return;
      }
      if (isFile && fileName !== '.DS_Store') {
        // 根据 fileObj 判读缓存数据 是否存在父亲目录
        const fileArr = fileObj.children.filter((ele: any) => {
          return ele.path === fileObj.path;
        });
        const obj: FileObj = {
          fileName,
          path: filedir,
          fromPath: filedir,
          isDir: !isFile,
          children: [],
        };
        // 如果有父级
        if (fileArr.length === 1) {
          fileArr[0].children.push(obj);
        } else {
          fileObj.children.push(obj);
        }
      }
      if (isDir) {
        const obj: FileObj = {
          fileName,
          path: filedir,
          fromPath: filedir,
          isDir,
          children: [],
        };
        // 根据 fileObj 判读缓存数据 是否存在父亲目录
        const dirArr = fileObj.children.filter((ele: any) => {
          return ele.path === fileObj.path;
        });
        // 如果有父级
        if (dirArr.length === 1) {
          dirArr[0].children.push(obj);
        } else {
          fileObj.children.push(obj);
        }
        this.fileDisplay(obj); // 递归，如果是文件夹，就继续遍历该文件夹下面的文件
      }
    });
  }

  /**
   * 获取模版文件结构
   * @param formData
   * @param obj
   */
  showStructure(formData: any, obj?: any): FileObj {
    const dirStructure: FileObj = {
      fileName: obj ? obj.fileName : this.templateModelName,
      path: obj ? obj.path : this.project.templateDir,
      fromPath: obj ? obj.path : this.project.templateDir,
      formData,
      isDir: true,
      children: [],
    };
    this.fileDisplay(dirStructure);
    return dirStructure;
  }

  /**
   * 生成pojo 与 vo
   * @param formData 模型属性
   */
  generatorPOJO(formData: Model) {
    // 解析sql文件
    const { tableArr } = formData;
    // 生成pojo文件
    if (formData.buildPath.length > 0) {
      tableArr.forEach((ele: any) => {
        // 包名
        const POJO_PACKAGE_STR = `package  ${getPackageName(
          formData.buildPath,
          'com'
        )} ;\r\n`;
        // 类名
        const pojoClassName = tranformHumpStr(ele.tableName);
        // 引入包
        let POJO_IMPORT_STR = `import java.io.Serializable;\r\nimport javax.persistence.*;\r\nimport java.math.BigDecimal;\r\nimport java.util.Date;\r\nimport io.swagger.annotations.ApiModelProperty;\r\nimport io.swagger.annotations.ApiModel;\r\nimport lombok.Data;\r\n@Data\r\n@Entity(name = "${ele.tableName}")\r\n`;
        // 如果有注释
        if (ele.tableComment && ele.tableComment.length > 0) {
          POJO_IMPORT_STR += `@ApiModel(value = "${ele.tableComment}")\r\n`;
        }
        // TODO: 判断类型 , 缺少Date\List\Map\Set导入包
        POJO_IMPORT_STR += '@SuppressWarnings("serial")\r\n';
        // 类
        let POJO_CLASS_BEGIN_STR = `public class ${pojoClassName} implements Serializable{\r\n`;

        // 如果有列
        if (ele.cloums && ele.cloums.length > 0) {
          ele.cloums.forEach((cloum: any) => {
            if (cloum.comment && cloum.comment.length > 0) {
              POJO_CLASS_BEGIN_STR += `\t@ApiModelProperty(value="${cloum.comment}")\r\n`;
            }
            // 处理ID
            if (cloum.name === 'id') {
              POJO_CLASS_BEGIN_STR += '\t@Id\r\n';
            }
            POJO_CLASS_BEGIN_STR += `\tprivate ${cloum.type} ${tranformHumpStr(
              cloum.name,
              false
            )} ;\r\n`;
          });
          // 生成get set 使用lombok
        }
        // TODO: 处理下状态类型
        const POJO_CLASS_END_STR = '}';
        const RESULT_STR =
          POJO_PACKAGE_STR +
          POJO_IMPORT_STR +
          POJO_CLASS_BEGIN_STR +
          POJO_CLASS_END_STR;
        fs.writeFileSync(
          path.join(formData.buildPath, pojoClassName + JAVA_SUFFIX),
          RESULT_STR
        );
      });
    }
    if (formData.buildPathVo.length > 0) {
      // 生成VO文件
      tableArr.forEach((ele: any) => {
        // 类名
        const pojoClassName = tranformHumpStr(ele.tableName);
        // 包名
        const POJO_PACKAGE_STR = `import ${getPackageName(
          formData.buildPath,
          'com'
        )}.${pojoClassName};\r\n`;

        // 包名
        const VO_PACKAGE_STR = `package ${getPackageName(
          formData.buildPathVo,
          'com'
        )};\r\n`;

        const voClassName = `${pojoClassName}VO`;
        // 引入包
        const pageParameterArr = this.findByKey('PageParameter.java', 1);
        let VO_IMPORT_STR = `${POJO_PACKAGE_STR}import java.io.Serializable;\r\nimport javax.persistence.Entity;\r\nimport javax.persistence.Id;\r\nimport io.swagger.annotations.ApiModel;\r\nimport ${getPackageName(
          pageParameterArr[0].value,
          'com'
        ).replaceAll(
          '.java',
          ''
        )};\r\nimport io.swagger.annotations.ApiModelProperty;\r\nimport lombok.Data;\r\n@Data\r\n@Entity(name = "${
          ele.tableName
        }")\r\n`;
        // 如果有注释
        if (ele.tableComment && ele.tableComment.length > 0) {
          VO_IMPORT_STR += `@ApiModel(value = "${ele.tableComment}VO")\r\n`;
        }
        VO_IMPORT_STR += '@SuppressWarnings("serial")\r\n';
        let VO_CLASS_BEGIN_STR = `public class ${voClassName} extends ${pojoClassName} implements Serializable{\r\n`;

        // 设置vo colums
        ele.voColums = [
          {
            name: 'ids',
            comment: 'ID集合，逗号分隔',
            type: 'String',
          },
          {
            name: 'page',
            comment: '当前页',
            type: 'Integer',
          },
          {
            name: 'rows',
            comment: '每页的条数',
            type: 'Integer',
          },
          {
            name: 'pageParameter',
            comment: '分页参数',
            type: 'PageParameter',
          },
          {
            name: 'column',
            comment: '列',
            type: 'String',
          },
        ];
        // 如果有列
        if (ele.voColums && ele.voColums.length > 0) {
          // 生成get set 使用lombok
          ele.voColums.forEach((cloum: any) => {
            if (cloum.comment && cloum.comment.length > 0) {
              VO_CLASS_BEGIN_STR += `\t@ApiModelProperty(value="${cloum.comment}")\r\n`;
            }
            VO_CLASS_BEGIN_STR += `\tprivate ${cloum.type} ${cloum.name};\r\n`;
          });
        }
        // TODO: 处理下状态类型

        const VO_CLASS_END_STR = '}';
        const RESULT_STR =
          VO_PACKAGE_STR +
          VO_IMPORT_STR +
          VO_CLASS_BEGIN_STR +
          VO_CLASS_END_STR;
        fs.writeFileSync(
          path.join(formData.buildPathVo, voClassName + JAVA_SUFFIX),
          RESULT_STR
        );
      });
    }
  }
}
