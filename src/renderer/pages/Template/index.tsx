import { useLiveQuery } from 'dexie-react-hooks';
import { SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Col,
  Descriptions,
  Divider,
  Input,
  List,
  message,
  Row,
  Space,
  Tabs,
  Tag,
} from 'antd';
import Search from 'antd/lib/input/Search';
import { execNpmCommand } from '../../util';
import styles from './index.module.less';
import TemplateDatabase from '../../dbModel';

const { TabPane } = Tabs;
const prefix = 'codefaster-';
const TemplatePage: React.FC = () => {
  const [templateResult, setTemplateResult] = useState<Npm.NpmTemplateResult>();
  const [activityResult, setActivityResult] = useState<Npm.Package>();
  const [installDetail, setInstallDetail] = useState<CodeFaster.Template>();

  const fetchNpm = async (params = '') => {
    const response = await fetch(
      `https://registry.npmjs.com/-/v1/search?text=${prefix}${params}`
    );
    if (response) {
      const data: Npm.NpmTemplateResult = await response.json();
      const templates = await TemplateDatabase.templates.toArray();
      data.objects.map((ele: Npm.WapperObject) => {
        if (templates) {
          ele.package.hasInstall = templates.some(
            (plugin) => plugin.templateName === ele.package.name
          );
        }
        return ele;
      });
      setTemplateResult(data);
    }
  };
  const addTemplate = (_activityResult: Npm.Package) => {
    // 判断是否重复下载
    const count = TemplateDatabase.templates
      .where('templateName')
      .equals(_activityResult.name)
      .count()
      .then(async (ele) => {
        if (ele === 0) {
          TemplateDatabase.templates.add({
            /** 模版下载地址 */
            url: _activityResult.links.npm,
            /** 模版名称 */
            templateName: _activityResult.name,
            /** 作者 */
            owner: _activityResult.author.name,
            /** 语言类型 1、Java 2、JavaScript */
            type: _activityResult.keywords[0] === 'java' ? 1 : 2,
            version: _activityResult.version,
            /** 简介 */
            description: _activityResult.description,
          });
          const result = await execNpmCommand('install', [
            _activityResult.name,
          ]);
          console.log(result);
          message.success({ content: '安装成功！' });
        } else {
          message.error('本地已安装');
        }
        if (activityResult) {
          setActivityResult({ ...activityResult, hasInstall: true });
          templateResult?.objects.map((e) => {
            e.package.hasInstall = true;
            return e;
          });
        }
        return ele;
      });
  };
  const removeTemplate = (ele: CodeFaster.Template) => {
    if (ele.id)
      TemplateDatabase.templates
        .where('id')
        .equals(ele.id)
        .delete()
        .then(async (deleteCount) => {
          setInstallDetail(undefined);
          const result = await execNpmCommand('uninstall', [ele.templateName]);
          console.log(result);
          message.success({ content: '删除成功！' });
          return deleteCount;
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e.stack || e);
        });
  };
  const updateTemplate = async (ele: CodeFaster.Template) => {
    const result = await execNpmCommand('install', [
      `${ele.templateName}@latest`,
    ]);
    console.log(result);
    message.success({ content: '更新成功！' });
  };
  const list = useLiveQuery(async () => {
    return TemplateDatabase.templates.toArray();
  });

  const getColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };
  useEffect(() => {
    fetchNpm();
    return () => {};
  }, []);
  return (
    <div>
      <Tabs type="card">
        <TabPane tab="模版市场" key="1">
          <Row gutter={16}>
            <Col span={10}>
              <Search
                className={styles.searchInput}
                size="large"
                allowClear
                placeholder="搜索模版"
                enterButton
                onSearch={(value) => {
                  fetchNpm(value);
                }}
              />
              <List
                itemLayout="horizontal"
                dataSource={templateResult?.objects}
                pagination={{ position: 'bottom' }}
                size="small"
                renderItem={(item: Npm.WapperObject) => (
                  <List.Item
                    key={item.package.name}
                    className={styles.listItemHover}
                    onClick={() => {
                      setActivityResult(item.package);
                    }}
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
                          {item.package.name
                            ?.substring(0, 1)
                            .toLocaleUpperCase()}
                        </Avatar>
                      }
                      title={item.package.name.replace(prefix, '')}
                      description={item.package.description}
                    />
                  </List.Item>
                )}
              />
            </Col>
            <Col span={1}>
              <Divider type="vertical" style={{ height: '100vh' }} />
            </Col>
            <Col span={13} style={{ overflowY: 'auto', height: '100vh' }}>
              {activityResult && (
                <Descriptions
                  title={activityResult?.name}
                  column={1}
                  bordered
                  labelStyle={{ width: 95 }}
                  extra={
                    activityResult?.hasInstall === false && (
                      <Button
                        onClick={() => {
                          addTemplate(activityResult);
                        }}
                      >
                        下载
                      </Button>
                    )
                  }
                >
                  <Descriptions.Item label="npm">
                    <a
                      href={activityResult?.links.npm}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {activityResult?.links.npm}
                    </a>
                  </Descriptions.Item>
                  <Descriptions.Item label="homepage">
                    <a
                      href={activityResult?.links.homepage}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {activityResult?.links.homepage}
                    </a>
                  </Descriptions.Item>
                  <Descriptions.Item label="repository">
                    <a
                      href={activityResult?.links.repository}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {activityResult?.links.repository}
                    </a>
                  </Descriptions.Item>
                  <Descriptions.Item label="bugs">
                    <a
                      href={activityResult?.links.bugs}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {activityResult?.links.bugs}
                    </a>
                  </Descriptions.Item>

                  <Descriptions.Item label="描述">
                    {activityResult?.description}
                  </Descriptions.Item>
                  <Descriptions.Item label="关键词">
                    {activityResult?.keywords &&
                      activityResult?.keywords.map((ele) => {
                        return (
                          <Tag color="blue" key={ele}>
                            {ele}
                          </Tag>
                        );
                      })}
                  </Descriptions.Item>
                  <Descriptions.Item label="版本">
                    {activityResult?.version}
                  </Descriptions.Item>
                  <Descriptions.Item label="作者">
                    {activityResult?.author.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="日期">
                    {activityResult?.date}
                  </Descriptions.Item>
                </Descriptions>
              )}
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
                renderItem={(item: CodeFaster.Template) => (
                  <List.Item
                    className={styles.listItemHover}
                    key={item.id}
                    onClick={() => {
                      setInstallDetail(item);
                    }}
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
                          {item.templateName
                            ?.substring(0, 1)
                            .toLocaleUpperCase()}
                        </Avatar>
                      }
                      title={item.templateName}
                      description={item.description}
                    />
                  </List.Item>
                )}
              />
            </Col>
            <Col span={1}>
              <Divider type="vertical" style={{ height: '100vh' }} />
            </Col>
            <Col span={13} style={{ overflowY: 'auto', height: '100vh' }}>
              {installDetail && (
                <Descriptions
                  title={installDetail?.templateName}
                  column={1}
                  bordered
                  labelStyle={{ width: 95 }}
                  extra={
                    <Space>
                      <Button
                        onClick={() => {
                          updateTemplate(installDetail);
                        }}
                      >
                        更新
                      </Button>
                      <Button
                        onClick={() => {
                          removeTemplate(installDetail);
                        }}
                      >
                        卸载
                      </Button>
                    </Space>
                  }
                >
                  <Descriptions.Item label="语法">
                    {installDetail?.type === 1 ? 'Java' : 'JavaScrpit'}
                  </Descriptions.Item>
                  <Descriptions.Item label="描述">
                    {installDetail?.description}
                  </Descriptions.Item>
                  <Descriptions.Item label="作者">
                    {installDetail?.owner}
                  </Descriptions.Item>
                  <Descriptions.Item label="仓库">
                    {installDetail?.url}
                  </Descriptions.Item>
                  <Descriptions.Item label="版本">
                    {installDetail?.version}
                  </Descriptions.Item>
                </Descriptions>
              )}
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};
export default TemplatePage;
