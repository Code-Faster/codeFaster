import { getRenderPropValue } from 'antd/lib/_util/getRenderPropValue';
import { Typography } from 'antd';

const { Text } = Typography;
/* eslint-disable react/prop-types */
export type DescriptionItemProps = {
  type?: 'horizontal' | 'vertical';
  title: string | React.ReactNode | undefined;
  /** 传入参数之后，将会限制content长度 */
  width?: number;
  content: string | undefined;
};

const DescriptionItem: React.FC<DescriptionItemProps> = ({
  title,
  content,
  width,
  type = 'horizontal',
}) => {
  const titleRenderDom = (
    <>
      {type === 'vertical' ? (
        <p>{title && getRenderPropValue(title)}:</p>
      ) : (
        <span style={{ paddingRight: 8 }}>
          {title && getRenderPropValue(title)}
        </span>
      )}
    </>
  );
  return (
    <div className="site-description-item-profile-wrapper">
      {titleRenderDom}
      <Text
        style={width ? { width: width - 60 } : undefined}
        ellipsis={width ? { tooltip: content } : false}
      >
        {content}
      </Text>
    </div>
  );
};
export default DescriptionItem;
