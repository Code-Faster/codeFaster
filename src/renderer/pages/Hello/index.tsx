/* eslint-disable no-console */
/* eslint-disable no-else-return */
/* eslint-disable promise/always-return */
import { FolderOpenOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  List,
  Modal,
  Row,
  Select,
  Space,
} from 'antd';
// eslint-disable-next-line import/order
import styles from './index.module.less';
import 'antd/dist/antd.variable.min.css';
import Meta from 'antd/lib/card/Meta';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import db from '../../dbModel';
import { openDirectoryDialog } from '../../util';

const scopedPackagePattern = new RegExp('^(?:@([^/]+?)[/])?([^/]+?)$');
const { Option } = Select;
const HelloPage: React.FC = () => {
  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [formRef] = Form.useForm();
  const projectList = useLiveQuery(async () => {
    return db.projects.toArray();
  });
  const importProject = async () => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const url = await openDirectoryDialog();
    db.projects.add({
      owner: '',
      templateId: 0,
      templateDir: '',
      // TODO：  拆分url 转化成dir + name
      projectDir: url,
      projectName: url,
      type: 1,
      description: '',
    });
    // 判断该目录下是否存在初始化的json,不存在抛出错误
  };

  /** 根据参数加载模版数据 */
  const loadTemplate = async (value: string) => {
    const list = await db.templates
      .where('type')
      .equals(parseInt(value, 10))
      .toArray();
    formRef.setFieldsValue({ templateId: '', templateList: list });
  };

  const createProject = () => {
    setCreateProjectModal(true);
    loadTemplate('1');
    formRef.resetFields();
  };
  /**
   * 新增项目
   * @returns
   */
  const CreateProjectModal = () => {
    return (
      <Modal
        title="新建项目"
        visible={createProjectModal}
        okText="确认"
        cancelText="取消"
        onOk={() => {
          formRef
            .validateFields()
            .then(async (values: Project) => {
              formRef.resetFields();
              console.log(values);
              const template = await db.templates.get({
                id: values.templateId,
              });
              if (template?.templateDir) {
                values.templateDir = template?.templateDir;
              } else {
                throw Error('the template must hava templateDir');
              }
              db.projects.add(values);
              setCreateProjectModal(false);
            })
            .catch((info) => {
              console.log('Validate Failed:', info);
            });
        }}
        onCancel={() => {
          setCreateProjectModal(false);
        }}
      >
        <Form
          layout="vertical"
          name="project"
          form={formRef}
          initialValues={{ type: '1', templateList: [] }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="projectName"
                label="项目名称"
                rules={[
                  {
                    required: true,
                    message: '请输入项目名称',
                  },
                  () => ({
                    validator(_, name: string) {
                      if (name === null || name === undefined) {
                        return Promise.reject(new Error(''));
                      } else if (name.trim() !== name) {
                        return Promise.reject(
                          new Error(
                            'name cannot contain leading or trailing spaces'
                          )
                        );
                      } else if (name.length > 214) {
                        return Promise.reject(
                          new Error(
                            'name can no longer contain more than 214 characters'
                          )
                        );
                      } else if (name.match(/^\./)) {
                        return Promise.reject(
                          new Error('name cannot start with a period')
                        );
                      } else if (name.match(/^_/)) {
                        return Promise.reject(
                          new Error('name cannot start with an underscore')
                        );
                      } else if (
                        /[~'!()*]/.test(name.split('/').slice(-1)[0])
                      ) {
                        return Promise.reject(
                          new Error(
                            'name can no longer contain special characters ("~\'!()*")'
                          )
                        );
                      } else if (encodeURIComponent(name) !== name) {
                        // Maybe it's a scoped package name, like @user/package
                        const nameMatch = name.match(scopedPackagePattern);
                        if (nameMatch) {
                          const user = nameMatch[1];
                          const pkg = nameMatch[2];
                          if (
                            encodeURIComponent(user) === user &&
                            encodeURIComponent(pkg) === pkg
                          ) {
                            return Promise.resolve();
                          }
                        }
                        return Promise.reject(
                          new Error(
                            'name can only contain URL-friendly characters'
                          )
                        );
                      } else {
                        return Promise.resolve();
                      }
                    },
                  }),
                ]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="projectDir"
                label="项目路径"
                rules={[{ required: true, message: '请选择项目文件路径' }]}
              >
                <Input
                  style={{ width: 'calc(100%)' }}
                  placeholder="请选择项目文件路径"
                  addonAfter={
                    <Form.Item noStyle>
                      <Button
                        type="link"
                        icon={<FolderOpenOutlined />}
                        style={{ height: 24 }}
                        onClick={async () => {
                          formRef.setFieldsValue({
                            projectDir: await openDirectoryDialog(),
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
            <Col span={12}>
              <Form.Item
                name="owner"
                label="作者"
                rules={[{ required: true, message: '请选择作者' }]}
              >
                <Select placeholder="请选择作者">
                  <Option value="Code Faster">Code Faster</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="语言类型"
                rules={[{ required: true, message: '请选择语言类型' }]}
              >
                <Select placeholder="请选择语言类型" onChange={loadTemplate}>
                  <Option value="1">Java</Option>
                  <Option value="2">JavaScript</Option>
                  <Option value="3" disabled>
                    NodeJs
                  </Option>
                  <Option value="4" disabled>
                    Go
                  </Option>
                  <Option value="5" disabled>
                    Python
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, curValues) =>
                  prevValues.templateList !== curValues.templateList
                }
              >
                {({ getFieldValue }) => {
                  const templateList: Template[] =
                    getFieldValue('templateList') || [];
                  return templateList.length ? (
                    <Form.Item
                      name="templateId"
                      label="项目模版"
                      rules={[{ required: true, message: '请选择项目模版' }]}
                    >
                      <Select placeholder="请选择项目类型">
                        {templateList?.map((template: Template) => (
                          <Option
                            key={`${template.id}`}
                            value={template.id || 0}
                          >
                            {template.templateName}({template.description})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item
                      name="templateId"
                      label="项目模版"
                      rules={[{ required: true, message: '请选择项目模版' }]}
                    >
                      <Select placeholder="请选择项目类型" />
                    </Form.Item>
                  );
                }}
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
        </Form>
      </Modal>
    );
  };
  const getColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };
  return (
    <div>
      <CreateProjectModal />
      <Card style={{ width: '100%', marginBottom: 15 }}>
        <Meta
          avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
          title="欢迎来到CodeFaster"
          description="CodeFaster帮助开发者更快、更安全、更高效的实现业务代码！"
        />
      </Card>
      <Row>
        <Col span={14}>
          <Input
            className={styles.searchInput}
            size="large"
            placeholder="搜索项目"
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col span={10} className={styles.searchButtonArea}>
          <Space>
            <Button type="primary" size="small" onClick={createProject}>
              新建项目
            </Button>
            <Button type="primary" size="small" onClick={importProject}>
              导入项目
            </Button>
            <Button type="primary" size="small">
              从Git获取项目
            </Button>
          </Space>
        </Col>
      </Row>
      <Divider style={{ margin: 5 }} />
      <List
        itemLayout="horizontal"
        dataSource={projectList}
        renderItem={(item: Project) => (
          <List.Item
            className={styles.listItemHover}
            actions={[
              <Link
                type="link"
                key={`${item.id}-detail`}
                to={`/project/${item.id}`}
              >
                查看
              </Link>,
              <Button
                type="link"
                key={`${item.id}-delate`}
                onClick={() => {
                  if (item.id) {
                    db.projects.where('id').equals(item.id).delete();
                  }
                }}
              >
                删除
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  style={{
                    backgroundColor: getColor(),
                    verticalAlign: 'middle',
                  }}
                  size="large"
                >
                  {item.projectName?.substring(0, 1).toLocaleUpperCase()}
                </Avatar>
              }
              title={item.projectName}
              description={item.projectDir}
            />
          </List.Item>
        )}
      />
    </div>
  );
};
export default HelloPage;
