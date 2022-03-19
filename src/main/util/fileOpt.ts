import fs from 'fs';
import ServiceApi from './ServiceAPI';
/** 读取文件 */
const fileReader = (filePath: string): string => {
  if (filePath === undefined) throw new Error('必须传入filePath');
  const stats = fs.statSync(filePath);
  if (stats.isFile()) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  throw new Error('传入的参数必须为文件地址');
};
/** 根据文件地址获取文件接口参数 */
const getApisFromPaths = (
  controllerList: Array<CodeFaster.SearchJSON>
): Array<CodeFaster.ControllerApi> => {
  if (controllerList.length === 0) return [];
  const apiJsonList: Array<CodeFaster.ControllerApi> = [];
  try {
    controllerList.forEach((c) => {
      // 读取controller
      const stats = fs.statSync(c.value);
      if (stats.isFile()) {
        const data = fs.readFileSync(c.value, 'utf-8').trim();
        const labelArr = c.label.split('/');
        const apiArr = data.split('\n');
        // 初始化controller层
        const item: CodeFaster.ControllerApi = {
          api: '',
          apiText: '',
          requestMapping: '',
          requestMappingText: '',
          result: [],
          isSkip: false,
          className: labelArr[labelArr.length - 1],
        };
        let API: CodeFaster.ServiceApi = new ServiceApi();
        apiArr.forEach((api) => {
          // 去除代码中空格
          const apiCopy = api.replace(/[\s]/g, '');
          if (apiCopy.indexOf('public') >= 0) {
            API.public = apiCopy;
            if (
              API.requestMapping.length > 0 ||
              API.postMapping.length > 0 ||
              API.getMapping.length > 0
            ) {
              item.result.push(API);
            }
            API = new ServiceApi();
          } else if (apiCopy.indexOf('@ApiOperation') >= 0) {
            API.apiOperation = apiCopy;
          } else if (apiCopy.indexOf('@PostMapping') >= 0) {
            API.postMapping = apiCopy;
          } else if (apiCopy.indexOf('@GetMapping') >= 0) {
            API.getMapping = apiCopy;
          } else if (apiCopy.indexOf('@RequestMapping') >= 0) {
            API.requestMapping = apiCopy;
          } else if (apiCopy.indexOf('@Api(') >= 0) {
            API.api = apiCopy;
          } else if (apiCopy.indexOf('@ApiImplicitParams') >= 0) {
            API.apiImplicitParams = apiCopy;
          } else if (apiCopy.indexOf('@ApiImplicitParam') >= 0) {
            API.apiImplicitParams += apiCopy;
          }
        });
        if (item.result.length > 0) {
          apiJsonList.push(item);
        }
      }
    });
    // 处理apiJson
    apiJsonList.forEach((api: CodeFaster.ControllerApi) => {
      api.api = api.result[0].api;
      api.apiText = api.result[0].api ? api.result[0].api.split('"')[1] : '';
      api.requestMapping = api.result[0].requestMapping;
      api.requestMappingText = api.result[0].requestMapping
        ? api.result[0].requestMapping.split('"')[1]
        : '';
      if (api.requestMappingText.match(/^\//) == null) {
        api.requestMappingText = `/${api.requestMappingText}`;
      }
      // 将类提取出来 到上一层
      api.result = api.result.filter((_ele, index: number) => {
        return index !== 0;
      });
      api.result.forEach((service: CodeFaster.ServiceApi) => {
        if (service.apiOperation) {
          service.apiOperationText = service.apiOperation.split('"')[1];
        }
        if (service.requestMapping) {
          service.requestMappingText = service.requestMapping.split('"')[1];
          service.requestMappingType = service.requestMapping.split('.')[1]
            ? service.requestMapping.split('.')[1].split(')')[0]
            : '';
        }
        if (service.postMapping) {
          service.requestMappingText = service.postMapping.split('"')[1];
          service.requestMappingType = 'POST';
        }
        // 处理不规范问题
        if (service.requestMappingType) {
          service.requestMappingType = service.requestMappingType.replace(
            /[({})"]/g,
            ''
          );
        }
        if (
          service.requestMappingText &&
          service.requestMappingText.match(/^\//) == null
        ) {
          service.requestMappingText = `/${service.requestMappingText}`;
        }
        service.apiImplicitParamsText = [];
        if (service.apiImplicitParams) {
          const paramsArray = service.apiImplicitParams
            .replace(/[({})"]/g, '')
            .split('@ApiImplicitParam')
            .filter((_ele, index: number) => {
              return index > 1;
            });
          paramsArray.forEach((param, index) => {
            const paramArr = param.split(',');
            const paramObj: any = {};
            paramArr.forEach((p) => {
              // 如果有 = 号
              if (p.indexOf('=') >= 0) {
                const splitArr = p.split('=');
                if (splitArr[0] === 'required') {
                  paramObj.required = splitArr[1] === 'true';
                } else {
                  paramObj[splitArr[0]] = splitArr[1];
                }
              }
            });
            paramObj.id = (Date.now() + index).toString();
            service.apiImplicitParamsText.push(paramObj);
          });
        }
      });
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
  return apiJsonList;
};
export default {
  fileReader,
  getApisFromPaths,
};
