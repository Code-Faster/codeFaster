import { Button, Form, FormInstance, message, Modal, Steps } from 'antd';
import { ReactNode, useEffect, useState } from 'react';

const { Step } = Steps;
type StepParams = {
  title: string;
  description?: string;
};
export type StepsFormProps = {
  type?: 'horizontal' | 'vertical';
  title: string;
  visible: boolean;
  width?: string | number;
  steps: Array<StepParams>;
  formRef: FormInstance<any> | undefined;
  onOk: ((e: any) => void) | undefined;
  onCancel:
    | ((e: React.MouseEvent<HTMLElement, MouseEvent>) => void)
    | undefined;
  formNodes: Array<ReactNode>;
};

const StepsForm: React.FC<StepsFormProps> = ({
  title,
  visible,
  width,
  onOk,
  onCancel,
  formRef,
  steps,
  formNodes,
}: StepsFormProps) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [tempForm, setTempForm] = useState({});
  const next = () => {
    if (formRef) {
      formRef
        .validateFields()
        .then(async (values) => {
          setCurrentStep(currentStep + 1);
          if (values && Object.keys(values).length > 0) {
            Object.assign(tempForm, values);
            setTempForm(tempForm);
          }
          return tempForm;
        })
        .catch((info) => {
          console.log('Validate Failed:', info);
        });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };
  const ok = () => {
    if (formRef) {
      formRef
        .validateFields()
        .then(async (values) => {
          if (values && Object.keys(values).length > 0) {
            Object.assign(tempForm, values);
            setTempForm(tempForm);
          }
          if (onOk) onOk(tempForm);
          formRef.resetFields();
          return values;
        })
        .catch((info) => {
          console.log('Validate Failed:', info);
        });
    }
  };
  const FooterButtons = (
    <>
      {currentStep > 0 && (
        <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
          上一步
        </Button>
      )}
      {currentStep < steps.length - 1 && (
        <Button type="primary" onClick={() => next()}>
          下一步
        </Button>
      )}
      {currentStep === steps.length - 1 && (
        <Button type="primary" onClick={ok}>
          确定
        </Button>
      )}
    </>
  );
  useEffect(() => {
    if (formRef && visible) {
      formRef.resetFields();
    }
    return () => {};
  }, []);

  return (
    <Modal
      title={title}
      width={width}
      visible={visible}
      onCancel={onCancel}
      footer={FooterButtons}
    >
      <Steps size="small" current={currentStep}>
        {steps.map((item: StepParams) => (
          <Step
            key={item.title}
            title={item.title}
            description={item.description}
          />
        ))}
      </Steps>
      <Form layout="vertical" form={formRef} style={{ marginTop: 10 }}>
        {formNodes[currentStep]}
      </Form>
    </Modal>
  );
};
export default StepsForm;
