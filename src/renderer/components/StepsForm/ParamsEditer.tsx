import ProCard from '@ant-design/pro-card';
import ProField from '@ant-design/pro-field';
import { EditableProTable, ProColumns } from '@ant-design/pro-table';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';

export type StepsFormProps = {
  visible: boolean;
  onOk: ((e: any) => void) | undefined;
  onCancel:
    | ((e: React.MouseEvent<HTMLElement, MouseEvent>) => void)
    | undefined;
  list: Array<CodeFaster.FlowParam>;
};

const StepsForm: React.FC<StepsFormProps> = ({
  visible,
  onOk,
  onCancel,
  list,
}: StepsFormProps) => {
  const [paramsList, setParamsList] = useState<Array<CodeFaster.FlowParam>>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>();
  // 参数列表
  const paramColumns: ProColumns<CodeFaster.FlowParam>[] = [
    {
      title: '参数名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [
          {
            required: true,
            whitespace: true,
            message: '此项是必填项',
          },
        ],
      },
    },
    {
      title: '参数描述',
      dataIndex: 'value',
    },
    {
      title: '参数值',
      dataIndex: 'data',
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
    },
    {
      title: '必传',
      dataIndex: 'required',
      valueType: 'select',
      request: async () => [
        {
          value: 'true',
          label: '必传',
        },
        {
          value: 'false',
          label: '非必传',
        },
      ],
    },
    {
      title: '前置接口',
      dataIndex: 'importApiIndex',
    },
    {
      title: '返回参数',
      dataIndex: 'importApiResponse',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 250,
      render: () => {
        return null;
      },
    },
  ];
  useEffect(() => {
    setParamsList(list);
    setEditableRowKeys(list.map((item) => item.id));
    return () => {
      setParamsList([]);
    };
  }, [visible]);

  return (
    <Modal
      title="节点参数列表"
      visible={visible}
      okText="确认"
      cancelText="取消"
      width={1000}
      onOk={() => {
        onOk && onOk(paramsList);
      }}
      onCancel={onCancel}
    >
      <EditableProTable<CodeFaster.FlowParam>
        rowKey="id"
        columns={paramColumns}
        maxLength={20}
        value={paramsList}
        recordCreatorProps={{
          newRecordType: 'dataSource',
          record: () => ({
            id: Date.now().toString(),
            name: 'new',
            data: '',
            required: true,
          }),
        }}
        onChange={setParamsList}
        editable={{
          type: 'multiple',
          editableKeys: editableKeys,
          actionRender: (_row, _config, defaultDoms) => {
            return [defaultDoms.delete];
          },
          onValuesChange: (record, recordList: Array<CodeFaster.FlowParam>) => {
            console.log(record, recordList);
            // if (record) {
            //   let isUpdate = false;
            //   recordList.forEach((e) => {
            //     if (e.name === record.name) {
            //       e = record;
            //       isUpdate = true;
            //     }
            //   });
            //   if (!isUpdate && record.name !== 'new') {
            //     console.log('新增');
            //     recordList.push(record);
            //   }
            // }
            setParamsList(recordList);
          },
          onChange: setEditableRowKeys,
        }}
      />
      <ProCard title="表格数据" headerBordered collapsible defaultCollapsed>
        <ProField
          fieldProps={{
            style: {
              width: '100%',
            },
          }}
          mode="read"
          valueType="jsonCode"
          text={JSON.stringify(paramsList)}
        />
      </ProCard>
    </Modal>
  );
};
export default StepsForm;
