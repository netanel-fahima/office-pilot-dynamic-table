import { RJSFSchema, UiSchema } from '@rjsf/utils';

export interface TableSchema {
  type: 'object';
  required?: string[];
  properties: {
    [key: string]: RJSFSchema & {
      addable?: boolean;
      tableOptions?: {
        width?: number;
        fixed?: 'left' | 'right' | boolean;
        ellipsis?: boolean;
        sortable?: boolean;
        filterable?: boolean;
        hidden?: boolean;
        order?: number;
        componentType?: string;
      };
      dropdownOptions?: {
        type?: 'static' | 'dynamic';
        values?: { label: string; value: string | number }[];
        sourceTable?: string;
        labelField?: string;
        valueField?: string;
      };
    };
  };
}

export interface SchemaConfig {
  id: string;
  tableName: string;
  schema: TableSchema;
  uiSchema: UiSchema;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export interface TableAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: any) => void;
  danger?: boolean;
  confirm?: {
    title: string;
    content: string;
  };
}