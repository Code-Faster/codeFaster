import { FolderOpenOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  FormInstance,
  Input,
  List,
  Modal,
  Row,
  Select,
  Space,
} from 'antd';
import styles from './index.module.less';
import 'antd/dist/antd.variable.min.css';
import Meta from 'antd/lib/card/Meta';
import { useRef, useState } from 'react';
const { Option } = Select;

const HelloPage: React.FC = () => {
  const [createProjectModel, setCreateProjectModel] = useState(false);
  const [formRef] = Form.useForm();
  const importProject = () => {
    openDirectoryDialog();
  };
  const openDirectoryDialog = (): string[] | any => {
    window.electron.ipcRenderer.execTask(
      window.electron.task.openDirectoryDialog
    );
    window.electron.ipcRenderer.once(
      window.electron.task.openDirectoryDialog,
      (arg: any) => {
        formRef.setFieldsValue({
          url: arg && arg[0],
        });
      }
    );
  };
  const createProject = () => {
    setCreateProjectModel(true);
  };
  const CreateProjectModel = () => {
    return (
      <Modal
        title="新建项目"
        visible={createProjectModel}
        okText="确认"
        cancelText="取消"
        onOk={() => {
          setCreateProjectModel(false);
        }}
        onCancel={() => {
          setCreateProjectModel(false);
        }}
      >
        <Form
          layout="vertical"
          hideRequiredMark
          name="project"
          form={formRef}
          initialValues={{ url: 'public' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectName"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="url"
                label="项目路径"
                rules={[{ required: true, message: '请选择项目文件路径' }]}
              >
                <Input
                  style={{ width: 'calc(100%)' }}
                  placeholder="请选择项目文件路径"
                  addonAfter={
                    <Form.Item name="suffix" noStyle>
                      <Button
                        type="link"
                        icon={<FolderOpenOutlined />}
                        style={{ height: 24 }}
                        onClick={async () => {
                          openDirectoryDialog();
                        }}
                      ></Button>
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
                  <Option value="Biqi Li">Biqi Li</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="项目类型"
                rules={[{ required: true, message: '请选择项目类型' }]}
              >
                <Select placeholder="请选择项目类型">
                  <Option value="private">私有化</Option>
                  <Option value="public">公共</Option>
                </Select>
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
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  };
  const listData = [
    {
      title: 'feilang',
      color: getColor(),
    },
    {
      title: 'zdnf',
      color: getColor(),
    },
    {
      title: 'restDemo',
      color: getColor(),
    },
    {
      title: 'RestLogin',
      color: getColor(),
    },
  ];
  return (
    <div style={{ padding: '20px' }}>
      <CreateProjectModel />
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
        dataSource={listData}
        renderItem={(item) => (
          <List.Item className={styles.listItemHover}>
            <List.Item.Meta
              avatar={
                <Avatar
                  style={{
                    backgroundColor: item.color,
                    verticalAlign: 'middle',
                  }}
                  size="large"
                >
                  {item.title.substring(0, 1).toLocaleUpperCase()}
                </Avatar>
              }
              title={item.title}
              description="~/Desktop/git/flJava/feilang"
            />
          </List.Item>
        )}
      />
    </div>
  );
};
export default HelloPage;
