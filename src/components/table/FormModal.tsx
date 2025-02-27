import React from 'react';
import { Modal } from 'antd';
import { Form } from '@rjsf/antd';
import validator from '@rjsf/validator-ajv8';
import type { SchemaConfig } from '../../types/schema';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemaConfig: SchemaConfig;
  editingRecord: any;
  onSubmit: (data: { formData: any }) => void;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  schemaConfig,
  editingRecord,
  onSubmit,
}) => {
  // סינון שדות שלא ניתנים להוספה
  const filteredSchema = {
    ...schemaConfig.schema,
    properties: Object.entries(schemaConfig.schema.properties)
      .filter(([_, prop]) => prop.addable !== false)
      .reduce((acc, [key, prop]) => ({ ...acc, [key]: prop }), {})
  };

  return (
    <Modal
      title={editingRecord ? 'עריכת רשומה' : 'הוספת רשומה'}
      open={isOpen}
      maskClosable={false}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Form
        schema={filteredSchema}
        uiSchema={schemaConfig.uiSchema}
        validator={validator}
        formData={editingRecord}
        showErrorList={false}
        liveValidate
        onSubmit={onSubmit}
        onChange={({ formData }) => {
          // Clean data as user types to prevent invalid properties
          const cleanedData = Object.keys(formData).reduce((acc, key) => {
            if (schemaConfig?.schema?.properties?.[key]) {
              acc[key] = formData[key];
            }
            return acc;
          }, {} as Record<string, any>);
          return { formData: cleanedData };
        }}
      />
    </Modal>
  );
};