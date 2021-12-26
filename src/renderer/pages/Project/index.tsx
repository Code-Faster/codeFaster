import {
  ConsoleSqlOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Space,
  Table,
  Tabs,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TableRowSelection } from 'antd/lib/table/interface';
import DbOpts from '../../util/dbOpts';
import db from '../../dbModel';
import DescriptionItem from '../../components/Description';
import MainOpts from '../../util/mainOpts';

const { TabPane } = Tabs;
const { Title } = Typography;

const ProjectPage: React.FC = () => {
  const [project, setProject] = useState<Project>({
    projectName: '',
    projectDir: '',
    description: '',
  });
  const [sqlConnections, setSqlConnections] = useState<SqlConnection[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [tableArr, setTableArr] = useState<[]>([]);
  const [sqlList, setSqlList] = useState<[]>([]);
  const [createSqlModal, setCreateSqlModal] = useState<boolean>(false);
  const params = useParams();
  const [modelForm] = Form.useForm();
  const [sqlForm] = Form.useForm();

  /**
   * 查询数据库连接
   */
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

  const onSelectChange = (_selectedKeys: React.Key[], selectedRows: any) => {
    setSelectedRowKeys(_selectedKeys);
    setTableArr(selectedRows);
  };
  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };
  /**
   * 新增项目
   * @returns
   */
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
            .then((values: SqlConnection) => {
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
  useEffect(() => {
    if (params.projectId) {
      db.projects
        .get({
          id: parseInt(params.projectId, 10),
        })
        .then((data) => {
          if (data) {
            setProject(data);
          }
          return data;
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e.stack || e);
        });
      queryAllSqlConnections();
    }
    return () => {};
  }, [params.projectId]);
  return (
    <main>
      <CreateSqlModal />
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
        <TabPane tab="模型生成" key="1">
          <Form
            layout="vertical"
            name="model"
            form={modelForm}
            onFinish={(values: Model) => {
              if (tableArr.length === 0) {
                message.error({ content: '请至少选择一个表！' });
              }
              values.tableArr = tableArr;
              MainOpts.createModel(values, project);
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
                      (ele: SqlConnection, index: number) => (
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
                            const json = await DbOpts.createMysqlConnection(
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
                  expandedRowRender={(record) => <p>{record.sql}</p>}
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
                              buildPath: await MainOpts.openDirectoryDialog(),
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
                              buildPathVo: await MainOpts.openDirectoryDialog(),
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
              </Space>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="CURD" key="2">
          <p>CURD</p>
        </TabPane>
        <TabPane tab="测试" key="3">
          <p>测试</p>
        </TabPane>
        <TabPane tab="运维" key="4">
          <p>运维</p>
        </TabPane>
      </Tabs>
    </main>
  );
};
export default ProjectPage;
