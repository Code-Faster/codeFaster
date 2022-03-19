/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-plusplus */
import {
  ConsoleSqlOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  UserOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TableRowSelection } from 'antd/lib/table/interface';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-form';
import TestFlowStepsForm from 'renderer/components/StepsForm/TestFlowStepsForm';
import { UnControlled as UnControlledCodeMirror } from 'react-codemirror2';
import CodeMirror from 'codemirror/src/codemirror';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import db from '../../dbModel';
import DescriptionItem from '../../components/Description';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line'; // 当前行高亮
import 'codemirror/lib/codemirror.css'; // 编辑器样式
import 'codemirror/theme/material.css';

import {
  updateProjectConfig,
  createMysqlConnection,
  initProject,
  createModel,
  openDialog,
  generatorCURD,
  buildModelJson,
} from '../../util';

const { TabPane } = Tabs;
const { Title } = Typography;
const { Option } = Select;
const ProjectPage: React.FC = () => {
  const [project, setProject] = useState<CodeFaster.Project>({
    owner: '',
    templateName: '',
    projectDir: '',
    projectName: '',
    type: 1,
    description: '',
  });
  const [sqlConnections, setSqlConnections] = useState<
    CodeFaster.SqlConnection[]
  >([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [tableArr, setTableArr] = useState<CodeFaster.SqlTable[]>([]);
  const [sqlList, setSqlList] = useState<CodeFaster.SqlTable[]>([]);
  const [createSqlModal, setCreateSqlModal] = useState<boolean>(false);
  const [templateList, setTemplateList] = useState<CodeFaster.Template[]>();
  const params = useParams();
  const [modelForm] = Form.useForm();
  const [sqlForm] = Form.useForm();
  const [basicForm] = Form.useForm();
  const [CURDForm] = Form.useForm();
  const [deployForm] = Form.useForm();
  const [createTestFlowFrom] = Form.useForm();
  const [flowList, setFlowList] = useState<CodeFaster.TestFlow[]>();
  const [projectJSON, setProjectJSON] = useState<CodeFaster.ConfigJSON>();
  const [createTestFlowModal, setCreateTestFlowModal] =
    useState<boolean>(false);
  const [curFlow, setCurFlow] = useState<CodeFaster.TestFlow>();
  const [logs, setLogs] = useState<Array<any>>([]);
  const [logsStr, setLogsStr] = useState<string>('');
  const [showExportTestFlow, setShowExportTestFlow] = useState<boolean>(false);
  const [exportTestFlow, setExportTestFlow] = useState<CodeFaster.TestFlow[]>(
    []
  );
  /** 查询数据库连接 */
  const queryAllSqlConnections = () => {
    db.sqlConnections
      .toArray()
      .then((data) => {
        if (data) {
          setSqlConnections(data);
        }
        return data;
      })
      .catch((e) => {
        console.error(e.stack || e);
      });
  };
  /** 根据参数加载模版数据 */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadTemplate = (value: number | undefined) => {
    db.templates
      .where('type')
      .equals(parseInt(`${value}`, 10))
      .toArray()
      .then((ele) => {
        setTemplateList(ele);
        return ele;
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const onSelectChange = (
    _selectedKeys: React.Key[],
    selectedRows: CodeFaster.SqlTable[]
  ) => {
    setSelectedRowKeys(_selectedKeys);
    setTableArr(selectedRows);
  };
  const rowSelection: TableRowSelection<CodeFaster.SqlTable> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };
  /** 新增SQL链接 */
  const CreateSqlModal = () => {
    return (
      <Modal
        title="新建数据库连接"
        visible={createSqlModal}
        okText="确认"
        cancelText="取消"
        onOk={() => {
          sqlForm
            .validateFields()
            .then((values: CodeFaster.SqlConnection) => {
              sqlForm.resetFields();
              db.sqlConnections.add(values);
              setCreateSqlModal(false);
              queryAllSqlConnections();
              return values;
            })
            .catch((info) => {
              console.log('Validate Failed:', info);
            });
        }}
        onCancel={() => {
          setCreateSqlModal(false);
        }}
      >
        <Form
          layout="vertical"
          form={sqlForm}
          initialValues={{ type: '1', templateList: [] }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="connectionName"
                label="数据库昵称/别名"
                rules={[
                  {
                    required: true,
                    message: '请输入数据库昵称',
                  },
                ]}
              >
                <Input placeholder="请输入数据库昵称/别名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="database"
                label="库名"
                rules={[
                  {
                    required: true,
                    message: '请输入数据库库名',
                  },
                ]}
              >
                <Input placeholder="请输入数据库库名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="host"
                label="链接地址"
                rules={[
                  {
                    required: true,
                    message:
                      'Name or IP address of the server host - and TCP/IP port.',
                  },
                ]}
              >
                <Input placeholder="请输入链接地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="port"
                label="端口"
                rules={[
                  {
                    required: true,
                    message:
                      'Name or IP address of the server host - and TCP/IP port.',
                  },
                ]}
              >
                <InputNumber
                  placeholder="请输入端口"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="user"
                label="数据库用户名"
                rules={[
                  {
                    required: true,
                    message: 'Name of the user to connect with',
                  },
                ]}
              >
                <Input placeholder="请输入数据库用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="数据库密码"
                rules={[
                  {
                    required: true,
                    message: `The user's password. Will be requested later if it's not set.`,
                  },
                ]}
              >
                <Input placeholder="请输入数据库密码" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  };

  /** 新增测试流程 */
  const loadTestFlow = async () => {
    const list = await db.testFlows
      .where('projectId')
      .equals(parseInt(params.projectId!, 10))
      .toArray();
    setFlowList(list);
  };
  const CreateTestFlow = () => {
    return (
      <TestFlowStepsForm
        visibleModal={createTestFlowModal}
        setVisibleModal={setCreateTestFlowModal}
        formRef={createTestFlowFrom}
        projectJSON={projectJSON!}
        initDataSource={curFlow}
        onSumbit={(values) => {
          if (values.id) {
            db.testFlows.update(values.id, values);
          } else {
            // 保存流程
            db.testFlows.add(values);
          }
          loadTestFlow();
        }}
      />
    );
  };
  const execFetchApi = async (url: string, bodyData: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(bodyData),
    });
    if (!response.ok) {
      logs.push(`「节点异常：」`);
      setLogs(logs);
      setLogsStr(logs.join('\r\n'));
    }
    return response.json();
  };
  // 执行流程测试
  const execTestFlow = async (flow: CodeFaster.TestFlow) => {
    logs.push(`【${flow.name}】流程开始执行`);
    const preApiResult: Array<any> = [];
    for (const element of flow.nodes) {
      let url = flow.apiPath + element.serviceApi;
      if (flow.apiOtherParams) {
        const json = JSON.parse(flow.apiOtherParams);
        const urlParmas = Object.keys(json)
          .map(function (key) {
            return `${encodeURIComponent(
              key
            )}=${encodeURIComponent(json[key])}`;
          })
          .join('&');
        url = `${url}?${urlParmas}`;
      }
      if (element.service && element.service.requestMappingType === 'POST') {
        const result = Object.create(null);
        const paramsList = element.service.apiImplicitParamsText;
        if (paramsList.length > 0) {
          paramsList.forEach((param) => {
            // 如果引入外部接口
            if (param.importApiIndex) {
              const curData = preApiResult[param.importApiIndex - 1];
              console.log(curData);
              const resultStr = param.importApiResponse
                ? param.importApiResponse.split('.')
                : [];
              if (resultStr.length === 0) return;
              let curVar = curData[resultStr[0]];
              resultStr.forEach((str: unknown, index: number) => {
                if (index > 0) {
                  if (str.indexOf('[') > 0) {
                    // 数组形参数
                    const arr = str.replace(/\]/g, '').split('[');
                    curVar = curVar[arr[0]][arr[1]];
                  } else {
                    curVar = curVar[str];
                  }
                }
              });
              Object.defineProperty(result, param.name, {
                value: curVar,
                enumerable: true,
              });
            } else {
              if (undefined === param.data || param.data.length === 0) {
                logs.push(`${url}「参数不全」`);
              }
              Object.defineProperty(result, param.name, {
                value: param.data,
                enumerable: true,
              });
            }
          });
        }
        logs.push(`「节点：」${url}`);
        logs.push(`「入参：」${JSON.stringify(result)}`);
        const response = await execFetchApi(url, result);
        logs.push(`「回参：」${JSON.stringify(response)}`);
        preApiResult.push(response);
        setLogs(logs);
        setLogsStr(logs.join('\r\n'));
      }
    }
  };
  // 流程列表
  const columns: ProColumns<CodeFaster.TestFlow>[] = [
    {
      title: '流程名称',
      width: 120,
      dataIndex: 'name',
      fixed: 'left',
    },
    {
      title: '节点数量',
      width: 120,
      // align: 'right',
      render: (text, record, index) => [
        <span key="index">{record.nodes.length}</span>,
      ],
    },
    {
      title: '请求前缀',
      width: 120,
      // align: 'right',
      dataIndex: 'apiPath',
    },

    {
      title: '额外参数',
      width: 120,
      // align: 'right',
      dataIndex: 'apiOtherParams',
    },
    {
      title: '操作',
      width: 80,
      key: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (text, record, index) => [
        <Button
          type="link"
          key={`${record.id}-delate`}
          onClick={() => {
            execTestFlow(record);
          }}
        >
          执行
        </Button>,
        <Button
          type="link"
          key={`${record.id}-editer`}
          onClick={() => {
            setCurFlow(record);
            setCreateTestFlowModal(true);
          }}
        >
          编辑
        </Button>,
        <Button
          type="link"
          key={`${record.id}-delate`}
          onClick={() => {
            if (record.id) {
              db.testFlows.where('id').equals(record.id).delete();
              loadTestFlow();
            }
          }}
        >
          删除
        </Button>,
      ],
    },
  ];
  // 导入流程测试
  const ImportTestFlow = () => {
    return (
      <ModalForm<{
        name: string;
        company: string;
      }>
        title="导入流程"
        trigger={
          <Button type="primary" size="small">
            导入流程
          </Button>
        }
        autoFocusFirstInput
        modalProps={{
          onCancel: () => console.log('run'),
        }}
        onFinish={async (values) => {
          // await waitTime(2000);
          const importList: Array<CodeFaster.TestFlow> = JSON.parse(
            values.name
          );
          importList.forEach((iterator) => {
            // 重置导出数据的ID
            iterator.id = undefined;
            // 保存流程
            db.testFlows.add(iterator);
            loadTestFlow();
          });
          message.success('提交成功');
          return true;
        }}
      >
        <ProFormTextArea
          name="name"
          label="流程数组"
          tooltip="数组格式"
          placeholder="请输入导出的流程数组"
        />
      </ModalForm>
    );
  };
  useEffect(() => {
    if (params.projectId) {
      db.projects
        .get({
          id: parseInt(params.projectId, 10),
        })
        .then((data: CodeFaster.Project | undefined) => {
          if (data) {
            setProject(data);
            basicForm.setFieldsValue(data);
            loadTemplate(data.type);
            // eslint-disable-next-line promise/no-nesting
            updateProjectConfig(data)
              .then((e: CodeFaster.ConfigJSON) => {
                setProjectJSON(e);
                return e;
              })
              .catch((e) => {
                console.error(e.stack || e);
              });
          }
          return data;
        })
        .catch((e) => {
          console.error(e.stack || e);
        });
      db.testFlows
        .where('projectId')
        .equals(parseInt(params.projectId, 10))
        .toArray()
        .then((data: CodeFaster.TestFlow[]) => {
          if (data) {
            setFlowList(data);
          }
          return data;
        })
        .catch((e) => {
          console.error(e.stack || e);
        });
    }
    queryAllSqlConnections();

    return () => {
      setProject(Object.create(null));
      setProjectJSON(Object.create(null));
      setFlowList([]);
    };
  }, [basicForm, params.projectId]);
  return (
    <main>
      <CreateSqlModal />
      <CreateTestFlow />
      <Drawer
        title="导出流程信息"
        placement="bottom"
        onClose={() => {
          setShowExportTestFlow(false);
        }}
        visible={showExportTestFlow}
        key="exportTestFlow"
      >
        <UnControlledCodeMirror
          value={`[\r\n${exportTestFlow
            .map((e) => JSON.stringify(e))
            .join(',\r\n')}\r\n]`}
          options={{
            mode: 'application/json',
            theme: 'material',
            lineWrapping: false,
            styleActiveLine: true, // 选中行高亮
            gutters: ['CodeMirror-lint-markers'],
            lineNumbers: true,
            indentUnit: 4,
          }}
          onFocus={(editor) => {
            const totalLines = editor.lineCount();
            const from = { line: 0, ch: 0 };
            const to = { line: totalLines, ch: 0 };
            const cm = editor;
            const outer = cm.getMode();
            const text = cm.getRange(from, to).split('\n');
            const state = CodeMirror.copyState(
              outer,
              cm.getTokenAt(from).state
            );
            const tabSize = cm.getOption('tabSize');

            let out = '';
            let lines = 0;
            let atSol = from.ch === 0;
            function newline() {
              out += '\n';
              atSol = true;
              // eslint-disable-next-line no-plusplus
              ++lines;
            }

            for (let i = 0; i < text.length; ++i) {
              const stream = new CodeMirror.StringStream(text[i], tabSize);
              while (!stream.eol()) {
                const inner = CodeMirror.innerMode(outer, state);
                const style = outer.token(stream, state);
                const cur = stream.current();
                stream.start = stream.pos;
                if (!atSol || /\S/.test(cur)) {
                  out += cur;
                  atSol = false;
                }
                if (
                  !atSol &&
                  inner.mode.newlineAfterToken &&
                  inner.mode.newlineAfterToken(
                    style,
                    cur,
                    stream.string.slice(stream.pos) || text[i + 1] || '',
                    inner.state
                  )
                )
                  newline();
              }
              if (!stream.pos && outer.blankLine) outer.blankLine(state);
              if (!atSol) newline();
            }

            cm.operation(function () {
              cm.replaceRange(out, from, to);
              for (
                let cur = from.line + 1, end = from.line + lines;
                cur <= end;
                ++cur
              )
                cm.indentLine(cur, 'smart');
              cm.setSelection(from, cm.getCursor());
            });
          }}
        />
      </Drawer>
      <Typography style={{ position: 'relative' }}>
        <Title level={2}>{project?.projectName}</Title>
        <DescriptionItem
          title={() => {
            return <FolderOpenOutlined />;
          }}
          content={project?.projectDir}
        />
        <Button
          type="primary"
          style={{ position: 'absolute', top: 10, right: 10 }}
          onClick={() => {
            initProject(project);
            updateProjectConfig(project)
              .then((e) => {
                setProjectJSON(e);
                return e;
              })
              .catch((e) => {
                console.error(e.stack || e);
              });
          }}
        >
          初始化项目
        </Button>
        <DescriptionItem
          title={() => {
            return <InfoCircleOutlined color="#52d" />;
          }}
          content={project?.description}
        />
        <Divider style={{ marginBottom: 0 }} />
      </Typography>
      <Tabs style={{ paddingBottom: 16 }}>
        <TabPane tab="基础参数" key="0">
          <Form
            layout="vertical"
            form={basicForm}
            onFinish={(values: CodeFaster.Project) => {
              if (project.id) {
                db.projects.update(project.id, values);
              }
              message.success({ content: '更新成功！' });
            }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="templateName"
                  label="项目模版"
                  rules={[{ required: true, message: '请选择项目模版' }]}
                >
                  <Select placeholder="请选择项目类型">
                    {templateList?.map((template: CodeFaster.Template) => (
                      <Option
                        key={`${template.id}`}
                        value={template.templateName}
                      >
                        {template.templateName}({template.description})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="defaultPojoPath"
                  label="POJO目录"
                  rules={[
                    {
                      required: true,
                      message: 'POJO目录',
                    },
                  ]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请选择POJO目录"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            basicForm.setFieldsValue({
                              defaultPojoPath: (
                                await openDialog({
                                  defaultPath: project.projectDir,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="defaultVoPath"
                  label="VO目录"
                  rules={[{ required: true, message: '请选择VO目录' }]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请选择VO目录"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            basicForm.setFieldsValue({
                              defaultVoPath: (
                                await openDialog({
                                  defaultPath: project.projectDir,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="defaultServicePath"
                  label="Service默认目录"
                  rules={[{ required: true, message: '请选择Service默认目录' }]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请选择Service默认目录"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            basicForm.setFieldsValue({
                              defaultServicePath: (
                                await openDialog({
                                  defaultPath: project.projectDir,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="defaultServiceImplPath"
                  label="ServiceImpl默认目录"
                  rules={[
                    { required: true, message: '请选择ServiceImpl默认目录' },
                  ]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请选择ServiceImpl默认目录"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            basicForm.setFieldsValue({
                              defaultServiceImplPath: (
                                await openDialog({
                                  defaultPath: project.projectDir,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="defaultControllerPath"
                  label="Controller默认目录"
                  rules={[
                    { required: true, message: '请选择Controller默认目录' },
                  ]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请选择Controller默认目录"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            basicForm.setFieldsValue({
                              defaultControllerPath: (
                                await openDialog({
                                  defaultPath: project.projectDir,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="defaultMapperPath"
                  label="Mapper默认目录"
                  rules={[{ required: true, message: '请选择Mapper默认目录' }]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请选择Mapper默认目录"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            basicForm.setFieldsValue({
                              defaultMapperPath: (
                                await openDialog({
                                  defaultPath: project.projectDir,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="defaultUnitTestPath"
                  label="unitTest默认目录"
                  rules={[
                    { required: true, message: '请选择unitTest默认目录' },
                  ]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请选择unitTest默认目录"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            basicForm.setFieldsValue({
                              defaultUnitTestPath: (
                                await openDialog({
                                  defaultPath: project.projectDir,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="简介"
                  rules={[
                    {
                      required: true,
                      message: '请输入项目简介',
                    },
                  ]}
                >
                  <Input.TextArea rows={4} placeholder="请输入项目简介" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              wrapperCol={{ offset: 9, span: 6 }}
              style={{ paddingTop: 16 }}
            >
              <Space>
                <Button type="primary" htmlType="submit">
                  保存参数
                </Button>
                <Button
                  htmlType="button"
                  onClick={() => {
                    basicForm.resetFields();
                  }}
                >
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="模型生成" key="1">
          <Form
            layout="vertical"
            form={modelForm}
            onFinish={async (values: CodeFaster.ModelForm) => {
              if (tableArr.length === 0) {
                message.error({ content: '请至少选择一个表！' });
              }
              values.tableArray = tableArr;
              if (project.templateName) {
                createModel(project, values)
                  .then((data) => {
                    message.success({ content: '执行成功！' });
                    return data;
                  })
                  .catch((e) => {
                    throw Error(e.stack || e);
                  });
              }
              // 重置选择的表
              setSelectedRowKeys([]);
              setTableArr([]);
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="SQL链接"
                  rules={[{ required: true, message: '请选择SQL来源' }]}
                >
                  <Button
                    type="primary"
                    icon={<PlusCircleOutlined />}
                    onClick={() => {
                      setCreateSqlModal(true);
                    }}
                  >
                    添加数据库
                  </Button>
                  <Space direction="horizontal">
                    {sqlConnections?.map(
                      (ele: CodeFaster.SqlConnection, index: number) => (
                        <Card
                          size="small"
                          title={ele.connectionName}
                          key={ele.id}
                          hoverable
                          extra={
                            <Button
                              type="primary"
                              size="small"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (ele.id) {
                                  db.sqlConnections
                                    .where('id')
                                    .equals(ele.id)
                                    .delete()
                                    .then((deleteCount) => {
                                      queryAllSqlConnections();
                                      return deleteCount;
                                    })
                                    // eslint-disable-next-line @typescript-eslint/no-shadow
                                    .catch((e) => {
                                      console.error(e.stack || e);
                                    });
                                }
                              }}
                            >
                              删除
                            </Button>
                          }
                          style={{ width: '300px' }}
                          onClick={async () => {
                            const json = await createMysqlConnection(
                              sqlConnections[index]
                            );
                            setSqlList(json);
                          }}
                        >
                          <DescriptionItem
                            title={() => {
                              return <UserOutlined />;
                            }}
                            content={`${ele.user} / ${ele.database}`}
                          />
                          <DescriptionItem
                            title={() => {
                              return <ConsoleSqlOutlined />;
                            }}
                            width={300}
                            content={`${ele.host}:${ele.port}`}
                          />
                        </Card>
                      )
                    )}
                  </Space>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Alert
                  message="SQL格式"
                  description="建议数据库所有命名以‘_’区分，例如格式 : T_DB_NAME T_TABLE_NAME cloum_name ; 注释请勿使用'，'或者'；'."
                  type="info"
                />
                <Table
                  rowSelection={rowSelection}
                  rowKey={(record) => record.tableName}
                  expandedRowRender={(record) => <p>{record.tableSql}</p>}
                  columns={[
                    {
                      title: '库名',
                      dataIndex: 'dbName',
                    },
                    {
                      title: '表名',
                      dataIndex: 'tableName',
                    },
                  ]}
                  dataSource={sqlList}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="buildPath"
                  label="目标POJO地址"
                  rules={[
                    {
                      required: true,
                      message: '目标POJO地址',
                    },
                  ]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请选择目标POJO地址"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            modelForm.setFieldsValue({
                              buildPath: (
                                await openDialog({
                                  defaultPath: project.defaultPojoPath,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="buildPathVo"
                  label="目标VO地址"
                  rules={[{ required: true, message: '请选择目标VO地址' }]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请选择目标VO地址"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            modelForm.setFieldsValue({
                              buildPathVo: (
                                await openDialog({
                                  defaultPath: project.defaultVoPath,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="buildJsonPath" label="目标模型JSON地址">
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="目标模型JSON地址"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            modelForm.setFieldsValue({
                              buildJsonPath: (
                                await openDialog({
                                  defaultPath: project.projectDir,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              wrapperCol={{ offset: 6, span: 6 }}
              style={{ paddingTop: 16 }}
            >
              <Space>
                <Button type="primary" htmlType="submit">
                  立即生成模型
                </Button>
                <Button
                  htmlType="button"
                  onClick={() => {
                    modelForm.resetFields();
                  }}
                >
                  重置
                </Button>
                <Button
                  type="primary"
                  onClick={async () => {
                    const values = modelForm.getFieldsValue();
                    if (tableArr.length === 0) {
                      message.error({ content: '请至少选择一个表！' });
                    }
                    values.tableArray = tableArr;
                    await buildModelJson(values);
                  }}
                >
                  导出模型JSON
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="CURD" key="2">
          <Form
            layout="vertical"
            form={CURDForm}
            onFinish={async (values: CodeFaster.CURDForm) => {
              // 根据模版ID找到模版信息
              if (project) {
                if (project.templateName) {
                  generatorCURD(project, values)
                    .then((data) => {
                      message.success({ content: '执行成功！' });
                      return data;
                    })
                    .catch((e) => {
                      throw Error(e.stack || e);
                    });
                }
              }
            }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="pojo" hidden>
                  <Input placeholder="请输入项目名称" />
                </Form.Item>
                <Form.Item
                  name="pojoPath"
                  label="POJO地址"
                  rules={[
                    {
                      required: true,
                      message: '目标POJO地址',
                    },
                  ]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请选择目标POJO地址"
                    disabled
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            const dialog = await openDialog({
                              defaultPath: project.defaultPojoPath,
                              properties: ['openFile'],
                            });
                            CURDForm.setFieldsValue({
                              pojo: dialog.name,
                              pojoPath: dialog.path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="vo" hidden>
                  <Input placeholder="请输入项目名称" />
                </Form.Item>
                <Form.Item
                  name="voPath"
                  label="VO地址"
                  rules={[
                    {
                      required: true,
                      message: '目标VO地址',
                    },
                  ]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    disabled
                    placeholder="请选择目标VO地址"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            const dialog = await openDialog({
                              defaultPath: project.defaultVoPath,
                              properties: ['openFile'],
                            });
                            CURDForm.setFieldsValue({
                              vo: dialog.name,
                              voPath: dialog.path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="servicePath"
                  label="Service地址"
                  rules={[
                    {
                      required: true,
                      message: '目标Service地址',
                    },
                  ]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    disabled
                    placeholder="请选择目标Service地址"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            CURDForm.setFieldsValue({
                              servicePath: (
                                await openDialog({
                                  defaultPath: project.defaultServicePath,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="serviceImplPath"
                  label="ServiceImpl地址"
                  rules={[
                    {
                      required: true,
                      message: 'ServiceImpl地址',
                    },
                  ]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    disabled
                    placeholder="请选择ServiceImpl地址"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            CURDForm.setFieldsValue({
                              serviceImplPath: (
                                await openDialog({
                                  defaultPath: project.defaultServiceImplPath,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="controllerPath"
                  label="Controller地址"
                  rules={[
                    { required: true, message: '请选择目标Controller地址' },
                  ]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    disabled
                    placeholder="请选择目标Controller地址"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            CURDForm.setFieldsValue({
                              controllerPath: (
                                await openDialog({
                                  defaultPath: project.defaultControllerPath,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="mapperPath"
                  label="mapper地址"
                  rules={[{ required: true, message: '请选择目标mapper地址' }]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请选择目标mapper地址"
                    disabled
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            CURDForm.setFieldsValue({
                              mapperPath: (
                                await openDialog({
                                  defaultPath: project.defaultMapperPath,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="unitTestPath"
                  label="unitTest地址"
                  rules={[
                    { required: true, message: '请选择目标unitTest地址' },
                  ]}
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    disabled
                    placeholder="请选择目标unitTest地址"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<FolderOpenOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            CURDForm.setFieldsValue({
                              unitTestPath: (
                                await openDialog({
                                  defaultPath: project.defaultUnitTestPath,
                                  properties: ['openDirectory'],
                                })
                              ).path,
                            });
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              wrapperCol={{ offset: 9, span: 6 }}
              style={{ paddingTop: 16 }}
            >
              <Space>
                <Button type="primary" htmlType="submit">
                  立即生成CURD
                </Button>
                <Button
                  htmlType="button"
                  onClick={() => {
                    CURDForm.resetFields();
                  }}
                >
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="测试" key="3">
          <ProTable<CodeFaster.TestFlow>
            columns={columns}
            rowSelection={{
              // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
              // 注释该行则默认不显示下拉选项
              selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
              defaultSelectedRowKeys: [],
            }}
            tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
              <Space size={24}>
                <span>
                  已选 {selectedRowKeys.length} 项
                  <Button
                    style={{ marginLeft: 8 }}
                    onClick={onCleanSelected}
                    type="link"
                  >
                    取消选择
                  </Button>
                </span>
              </Space>
            )}
            tableAlertOptionRender={({ selectedRowKeys, selectedRows }) => {
              return (
                <Space size={16}>
                  <Button
                    type="primary"
                    size="small"
                    key="export"
                    onClick={() => {
                      setExportTestFlow(selectedRows);
                      setShowExportTestFlow(true);
                    }}
                  >
                    导出流程
                  </Button>
                </Space>
              );
            }}
            toolBarRender={() => [
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  setCurFlow(Object.create(null));
                  setCreateTestFlowModal(true);
                }}
              >
                新建流程
              </Button>,
              <ImportTestFlow />,
            ]}
            dataSource={flowList}
            options={false}
            search={false}
            pagination={false}
            rowKey="id"
          />
          <ProCard
            title="执行日志"
            headerBordered
            collapsible
            // defaultCollapsed
            extra={
              <Button
                size="small"
                type="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setLogs([]);
                  setLogsStr('');
                }}
              >
                清空日志
              </Button>
            }
          >
            <UnControlledCodeMirror
              value={logsStr}
              options={{
                mode: 'javascript',
                theme: 'material',
                lineNumbers: true,
              }}
              onChange={(editor, data, value) => {}}
            />
          </ProCard>
        </TabPane>
        <TabPane tab="运维" key="4">
          <Form
            layout="vertical"
            form={deployForm}
            onFinish={(values: CodeFaster.Project) => {
              if (project.id) {
                db.projects.update(project.id, values);
              }
              message.success({ content: '更新成功！' });
            }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="testWebhook" label="测试环境Webhook">
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请输入测试环境Webhook"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<PlayCircleOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            console.log(
                              `curl --header "Content-Type: application/json" --request POST --data '{}' ${deployForm.getFieldValue(
                                'testWebhook'
                              )}`
                            );
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="prePublishWebhook"
                  label="线上预发布环境Webhook"
                >
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请输入线上预发布环境Webhook"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<PlayCircleOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            console.log(
                              `curl --header "Content-Type: application/json" --request POST --data '{}' ${deployForm.getFieldValue(
                                'prePublishWebhook'
                              )}`
                            );
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="publishWebhook" label="正式环境Webhook">
                  <Input
                    style={{ width: 'calc(100%)' }}
                    placeholder="请输入正式环境Webhook"
                    addonAfter={
                      <Form.Item noStyle>
                        <Button
                          type="link"
                          icon={<PlayCircleOutlined />}
                          style={{ height: 24 }}
                          onClick={async () => {
                            console.log(
                              `curl --header "Content-Type: application/json" --request POST --data '{}' ${deployForm.getFieldValue(
                                'publishWebhook'
                              )}`
                            );
                          }}
                        />
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              wrapperCol={{ offset: 9, span: 6 }}
              style={{ paddingTop: 16 }}
            >
              <Space>
                <Button type="primary" htmlType="submit">
                  保存参数
                </Button>
                <Button
                  htmlType="button"
                  onClick={() => {
                    deployForm.resetFields();
                  }}
                >
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </main>
  );
};
export default ProjectPage;
