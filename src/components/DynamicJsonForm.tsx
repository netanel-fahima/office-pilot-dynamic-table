import React from 'react';
import { Form } from '@rjsf/antd';
import validator from '@rjsf/validator-ajv8';
import { message } from 'antd';
import type { SchemaConfig } from '../types/schema';

interface DynamicJsonFormProps {
  schemaConfig: SchemaConfig;
  formData?: any;
  onSubmit: (data: { formData: any }) => void;
}

export const DynamicJsonForm: React.FC<DynamicJsonFormProps> = ({
  schemaConfig,
  formData,
  onSubmit,
}) => {

  const schema = schemaConfig.schema;
  delete schema.tableOptions;

  // סינון שדות שלא ניתנים להוספה
  const filteredSchema = {
    ...schema,
    properties: Object.entries(schema.properties)
      .filter(([_, prop]) => prop.addable !== false)
      .reduce((acc, [key, prop]) => ({ ...acc, [key]: prop }), {})
  };

  return (
    <Form
      schema={filteredSchema}
      uiSchema={schemaConfig.uiSchema}
      validator={validator}
      formData={formData}
      onSubmit={onSubmit}
      showErrorList={false}
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
      onError={(errors) => {
        if (errors.length > 0) {
          const errorMessages = errors
            .map(error => error.message)
            .filter(Boolean);
          
          if (errorMessages.length > 0) {
            message.error(errorMessages.join(', '));
          } else {
            message.error('נא לתקן את השגיאות בטופס');
          }
        }
      }}
    />
  );
};