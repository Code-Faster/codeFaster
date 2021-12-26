import { SearchOutlined } from '@ant-design/icons';
import { Avatar, Col, Divider, Input, List, Radio, Row, Tabs } from 'antd';
// eslint-disable-next-line import/order
import styles from './index.module.less';
import 'antd/dist/antd.variable.min.css';
import TemplateDatabase from '../../dbModel';
// eslint-disable-next-line import/order
import { useLiveQuery } from 'dexie-react-hooks';
import DescriptionItem from '../../components/Description';

const { TabPane } = Tabs;
const TemplatePage: React.FC = () => {
  const list = useLiveQuery(async () => {
    return TemplateDatabase.templates.toArray();
  });
  const getColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };
  return (
    <div>
      <Tabs type="card">
        <TabPane tab="模版市场" key="1">
          <Row gutter={16}>
            <Col span={10}>
              <Input
                className={styles.searchInput}
                size="large"
                placeholder="搜索模版"
                prefix={<SearchOutlined />}
              />
              <Divider style={{ margin: 5 }} />
              <List
                itemLayout="horizontal"
                dataSource={list}
                renderItem={(item: Template) => (
                  <List.Item className={styles.listItemHover}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: getColor(),
                            verticalAlign: 'middle',
                          }}
                          size="large"
                        >
                          {item.templateName
                            ?.substring(0, 1)
                            .toLocaleUpperCase()}
                        </Avatar>
                      }
                      title={item.templateName}
                      description={item.templateDir}
                    />
                  </List.Item>
                )}
              />
            </Col>
            <Col span={1}>
              <Divider type="vertical" style={{ height: '100vh' }} />
            </Col>
            <Col span={13} style={{ overflowY: 'auto', height: '100vh' }}>
              <p
                className="site-description-item-profile-p"
                style={{ marginBottom: 24 }}
              >
                User Profile
              </p>
              <Row>
                <Col span={24}>
                  <DescriptionItem
                    type="vertical"
                    title="Skills"
                    content="C / C + +, data structures, software engineering, operating systems, computer networks, databases, compiler theory, computer architecture, Microcomputer Principle and Interface Technology, Computer English, Java, ASP, etc."
                  />
                </Col>
              </Row>
              <Divider />
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="已下载" key="2">
          <Row gutter={16}>
            <Col span={10}>
              <Input
                className={styles.searchInput}
                size="large"
                placeholder="搜索模版"
                prefix={<SearchOutlined />}
              />
              <Divider style={{ margin: 5 }} />
              <List
                itemLayout="horizontal"
                dataSource={list}
                renderItem={(item: Template) => (
                  <List.Item className={styles.listItemHover}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: getColor(),
                            verticalAlign: 'middle',
                          }}
                          size="large"
                        >
                          {item.templateName
                            ?.substring(0, 1)
                            .toLocaleUpperCase()}
                        </Avatar>
                      }
                      title={item.templateName}
                      description={item.templateDir}
                    />
                  </List.Item>
                )}
              />
            </Col>
            <Col span={1}>
              <Divider type="vertical" style={{ height: '100vh' }} />
            </Col>
            <Col span={13} style={{ overflowY: 'auto', height: '100vh' }}>
              <p
                className="site-description-item-profile-p"
                style={{ marginBottom: 24 }}
              >
                User Profile
              </p>
              <p className="site-description-item-profile-p">Personal</p>
              <Row>
                <Col span={12}>
                  <DescriptionItem
                    type="vertical"
                    title="Full Name"
                    content="Lily"
                  />
                </Col>
                <Col span={12}>
                  <DescriptionItem
                    type="vertical"
                    title="Account"
                    content="AntDesign@example.com"
                  />
                </Col>
              </Row>
              <Divider />
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};
export default TemplatePage;
