import { Button, Col, Form, FormInstance, Input, Row, Select } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { getApis } from 'renderer/util';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable, { EditableProTable } from '@ant-design/pro-table';
import StepsForm from './index';
import ProCard from '@ant-design/pro-card';
import ProField from '@ant-design/pro-field';
import ParamsEditer from './ParamsEditer';

const { Option } = Select;
/**
 * 根据文档结构json 迭代出匹配关键字地址
 * @param result Array<CodeFaster.SearchJSON>
 * @param jsonData jsonData 目录结构json
 * @param key 关键字
 * @param type 搜索文件夹 还是 文件 默认0 :文件夹 1: 文件 2、模糊搜索文件
 * @returns Array<CodeFaster.SearchJSON>
 */
const serachFromConfigJSON = (
  result: Array<CodeFaster.SearchJSON>,
  jsonData: CodeFaster.ConfigJSON,
  key: string,
  type = 2
): Array<CodeFaster.SearchJSON> => {
  // 如果是文件夹
  if (jsonData.isDir) {
    if (jsonData.fileName === key && type === 0) {
      result.push({
        label: jsonData.fileName,
        title: jsonData.sortPath,
        value: jsonData.path,
      });
    }
    // 如果还有子文件, 递归执行
    if (jsonData.children.length > 0) {
      jsonData.children.forEach((obj: CodeFaster.ConfigJSON) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        serachFromConfigJSON(result, obj, key, type);
      });
    }
  } else {
    // 如果搜索文件
    if (type === 1 && jsonData.fileName === key) {
      result.push({
        label: jsonData.fileName,
        title: jsonData.sortPath,
        value: jsonData.path,
      });
    }
    if (type === 2 && jsonData.fileName.includes(key)) {
      result.push({
        label: jsonData.fileName,
        title: jsonData.sortPath,
        value: jsonData.path,
      });
    }
  }
  return result;
};
export type TestFlowStepsFormProps = {
  visibleModal: boolean;
  setVisibleModal: React.Dispatch<React.SetStateAction<boolean>>;
  formRef: FormInstance<any>;
  projectJSON: CodeFaster.ConfigJSON;
  onSumbit: (values: CodeFaster.TestFlow) => void;
  // 编辑时候需要传入流程参数
  initDataSource?: CodeFaster.TestFlow;
};

const TestFlowStepsForm: React.FC<TestFlowStepsFormProps> = ({
  visibleModal,
  setVisibleModal,
  formRef,
  projectJSON,
  onSumbit,
  initDataSource,
}: TestFlowStepsFormProps) => {
  const [treeData, setTreeData] = useState<Array<CodeFaster.SearchJSON>>([]);
  const [editModal, setEditModal] = useState<boolean>(false);
  const [curNode, setCurNode] = useState<CodeFaster.FlowNode>(
    Object.create(null)
  );
  const [serviceList, setServiceList] = useState<
    Array<CodeFaster.ControllerApi>
  >([]);
  const [serviceListObject, setServiceListObject] = useState<
    Array<{
      label: string;
      value: string;
    }>
  >([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [serviceDataSource, setServiceDataSource] = useState<
    CodeFaster.FlowNode[]
  >([]);
  const actionRef = useRef<ActionType>();
  // 节点列表
  const serviceColumns: ProColumns<CodeFaster.FlowNode>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      width: 80,
    },
    {
      title: '节点信息',
      dataIndex: 'serviceApi',
      valueType: 'select',
      fieldProps: (form, { rowKey }) => {
        return {
          options: serviceListObject,
          onSelect: () => {
            // 每次选中重置参数
            if (rowKey) {
              const curForm: CodeFaster.FlowNode =
                form.getFieldsValue()[rowKey];
              serviceList.forEach((x) => {
                x.result.forEach((y) => {
                  if (
                    x.requestMappingText + y.requestMappingText ===
                    curForm.serviceApi
                  ) {
                    Object.defineProperties(curForm, {
                      serviceText: {
                        value: y.apiOperationText,
                        writable: true,
                        enumerable: true,
                      },
                      service: {
                        value: y,
                        writable: true,
                        enumerable: true,
                      },
                    });
                    form.setFieldsValue({ [rowKey]: curForm });
                  }
                });
              });
            }
          },
        };
      },
    },
    {
      title: '节点',
      dataIndex: 'serviceText',
      hideInTable: true,
    },
    {
      title: '详细信息',
      dataIndex: 'service',
      hideInTable: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (_text, record) => [
        <Button
          type="link"
          key="edit"
          size="small"
          onClick={() => {
            actionRef.current?.startEditable?.(record.id);
          }}
        >
          编辑
        </Button>,
        <Button
          type="link"
          key="delete"
          size="small"
          // icon={<MinusCircleOutlined />}
          onClick={() => {
            setServiceDataSource(
              serviceDataSource.filter((item) => item.id !== record.id)
            );
          }}
        >
          删除
        </Button>,
        <Button
          type="link"
          size="small"
          key="editParams"
          onClick={() => {
            if (record.service?.apiImplicitParamsText) {
              setCurNode(record);
              setEditModal(true);
            }
          }}
        >
          参数维护
        </Button>,
      ],
    },
  ];
  const paramColumns: ProColumns<CodeFaster.FlowParam>[] = [
    {
      title: '参数名称',
      dataIndex: 'name',
    },
    {
      title: '参数描述',
      dataIndex: 'value',
    },
    {
      title: '参数值',
      dataIndex: 'data',
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
    },
    {
      title: '必传',
      dataIndex: 'required',
      valueType: 'select',
      request: async () => [
        {
          value: 'true',
          label: '必传',
        },
        {
          value: 'false',
          label: '非必传',
        },
      ],
    },
    {
      title: '前置接口',
      dataIndex: 'importApiIndex',
    },
    {
      title: '返回参数',
      dataIndex: 'importApiResponse',
    },
  ];
  // 参数维护
  const expandedRowRender = (record: any) => {
    return (
      <ProTable<CodeFaster.FlowParam>
        rowKey="name"
        columns={paramColumns}
        headerTitle={false}
        search={false}
        options={false}
        dataSource={record.service.apiImplicitParamsText}
        pagination={false}
      />
    );
  };
  useEffect(() => {
    if (formRef && initDataSource) {
      console.log('初始化组件数据', initDataSource);
      formRef.setFieldsValue(initDataSource);
      if (initDataSource.nodes) {
        setTreeData(initDataSource.controllerList);
        console.log(initDataSource.serviceList)
        setServiceList(initDataSource.serviceList);
        setServiceDataSource(initDataSource.nodes);
      }
    }
    return () => {
      setServiceDataSource([]);
      setServiceList([]);
      setTreeData([]);
    };
  }, [initDataSource]);

  return (
    <>
      <ParamsEditer
        visible={editModal}
        onOk={(values) => {
          if (curNode.service) {
            curNode.service.apiImplicitParamsText = values;
            setCurNode(curNode);
            setEditModal(false);
          }
        }}
        onCancel={() => {
          setEditModal(false);
        }}
        list={curNode.service ? curNode.service.apiImplicitParamsText : []}
      />
      <StepsForm
        title="新建测试流程"
        visible={visibleModal}
        width={1000}
        onOk={(values: CodeFaster.TestFlow) => {
          values.nodes = serviceDataSource;
          values.controllerList = treeData;
          values.serviceList = serviceList;
          if (projectJSON.project?.id)
            values.projectId = projectJSON.project?.id;
          if (initDataSource && initDataSource.id) {
            values.id = initDataSource.id;
          }
          onSumbit(values);
          setVisibleModal(false);
        }}
        onCancel={() => {
          setVisibleModal(false);
        }}
        formRef={formRef}
        steps={[
          { title: '基础信息', description: '采集项目信息' },
          { title: '节点维护', description: '维护接口API与参数' },
        ]}
        formNodes={[
          <>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="流程名称"
                  rules={[
                    {
                      required: true,
                      message: '请输入流程名称',
                    },
                  ]}
                >
                  <Input placeholder="请输入流程名称" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="apiPath"
                  label="接口请求前缀"
                  rules={[
                    {
                      required: true,
                      message: '请输入接口请求前缀',
                    },
                  ]}
                >
                  <Input placeholder="请输入接口请求前缀" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="apiOtherParams" label="额外参数">
                  <Input.TextArea
                    rows={4}
                    placeholder="请输入接口额外参数，JSON格式"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="节点来源"
                  name="controller"
                  rules={[
                    {
                      required: true,
                      message: '请选择接口来源',
                    },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="请输入参数"
                    mode="multiple"
                    filterOption={false}
                    onSearch={(key: string) => {
                      if (key) {
                        setTreeData(serachFromConfigJSON([], projectJSON, key));
                      } else {
                        setTreeData([]);
                      }
                    }}
                    onChange={(item) => {
                      const params: Array<CodeFaster.SearchJSON> = [];
                      item.forEach((e: number) => {
                        return params.push(treeData[e]);
                      });
                      getApis(params)
                        .then((e: Array<CodeFaster.ControllerApi>) => {
                          setServiceList(e);
                          const rusult: Array<{
                            label: string;
                            value: string;
                          }> = [];
                          e.forEach((x) => {
                            x.result.forEach((y) => {
                              rusult.push({
                                label: `「${y.apiOperationText}」${x.requestMappingText}${y.requestMappingText}`,
                                value:
                                  x.requestMappingText + y.requestMappingText,
                              });
                            });
                          });
                          setServiceListObject(rusult);
                          console.log(rusult);
                          return e;
                        })
                        .catch(console.log);
                    }}
                    notFoundContent={null}
                  >
                    {treeData.map(
                      (item: CodeFaster.SearchJSON, index: number) => (
                        <Option
                          key={item.value}
                          value={index}
                          label={item.label}
                        >
                          <div>
                            {item.label}「{item.title.split('/')[0].toString()}
                            」
                          </div>
                        </Option>
                      )
                    )}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>,
          <>
            <Row gutter={16}>
              <Col span={24}>
                <EditableProTable<CodeFaster.FlowNode>
                  actionRef={actionRef}
                  rowKey="id"
                  maxLength={20}
                  columns={serviceColumns}
                  value={serviceDataSource}
                  expandable={{ expandedRowRender }}
                  recordCreatorProps={{
                    record: () => ({
                      id: new Date().getTime(),
                      serviceApi: '',
                    }),
                  }}
                  onChange={setServiceDataSource}
                  editable={{
                    type: 'multiple',
                    editableKeys: editableKeys,
                    onChange: setEditableRowKeys,
                    onSave: async (_key, data, newLine) => {
                      data.index = newLine.index;
                      if (newLine.index && serviceDataSource[newLine.index]) {
                        serviceDataSource[newLine.index] = data;
                      } else {
                        serviceDataSource.push(data);
                      }
                      setServiceDataSource(serviceDataSource);
                    },
                  }}
                />
                <ProCard
                  title="表格数据"
                  headerBordered
                  collapsible
                  defaultCollapsed
                >
                  <ProField
                    fieldProps={{
                      style: {
                        width: '100%',
                      },
                    }}
                    mode="read"
                    valueType="jsonCode"
                    text={JSON.stringify(serviceDataSource)}
                  />
                </ProCard>
              </Col>
            </Row>
          </>,
        ]}
      />
    </>
  );
};

export default TestFlowStepsForm;
