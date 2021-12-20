import { SearchOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Input,
  List,
  Row,
  Space,
} from 'antd';
import styles from './index.module.less';
import 'antd/dist/antd.variable.min.css';
import Meta from 'antd/lib/card/Meta';
import { Link } from 'react-router-dom';
// import ProCard from '@ant-design/pro-card';

const HelloPage: React.FC = () => {
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
            <Button type="primary" size="small">
              新建项目
            </Button>
            <Button type="primary" size="small">
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
              title={<a href="https://ant.design">{item.title}</a>}
              description="~/Desktop/git/flJava/feilang"
            />
          </List.Item>
        )}
      />
    </div>
  );
};
export default HelloPage;
