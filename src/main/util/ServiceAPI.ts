class ServiceApi implements CodeFaster.ServiceApi {
  //
  public api: string = '';

  //
  public apiText: string = '';

  //
  public requestMapping: string = '';

  //
  public requestMappingText: string = '';

  //
  public requestMappingType: string = '';

  //
  public apiOperation: string = '';

  //
  public apiOperationText: string = '';

  //
  public postMapping: string = '';

  //
  public getMapping: string = '';

  // 参数
  public apiImplicitParamsText: Array<CodeFaster.FlowParam> = [];

  //
  public apiImplicitParams: string = '';

  //
  public public: string = '';
}

export default ServiceApi;
