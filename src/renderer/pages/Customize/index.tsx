import { useState } from 'react';
import { ColorResult, SketchPicker } from 'react-color';
import { Button, Col, ConfigProvider, Row, Space, Typography } from 'antd';

const { Title } = Typography;
const CustomizePage: React.FC = () => {
  const bgColor = '#6667AB';
  const [color, setColor] = useState(bgColor);
  const colorChage = (colorValue: ColorResult) => {
    ConfigProvider.config({
      theme: {
        primaryColor: colorValue.hex,
      },
    });
    setColor(colorValue.hex);
  };
  return (
    <div style={{ padding: '20px' }}>
      <Row>
        <Col span={18}>
          <Title level={3}>主题设置</Title>
        </Col>
        <Col span={6} style={{ textAlign: 'right' }}>
          <Button
            size="small"
            type="primary"
            onClick={() => {
              ConfigProvider.config({
                theme: {
                  primaryColor: bgColor,
                },
              });
            }}
          >
            重置
          </Button>
        </Col>
      </Row>
      <div style={{ paddingBottom: 15 }}>
        <SketchPicker color={color} onChangeComplete={colorChage} />
      </div>
      <Row>
        <Col span={18}>
          <Title level={3}>Keymap</Title>
        </Col>
        <Col span={6} style={{ textAlign: 'right' }}>
          <Button size="small" type="primary">
            重置
          </Button>
        </Col>
      </Row>
      <Space direction="vertical">
        <Button type="link">导入设置</Button>
        <Button type="link">全部设置</Button>
      </Space>
    </div>
  );
};
export default CustomizePage;
