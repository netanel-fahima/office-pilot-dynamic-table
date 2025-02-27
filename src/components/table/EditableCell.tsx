import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Checkbox, DatePicker, TimePicker } from 'antd';
import { RJSFSchema } from '@rjsf/utils';
import { getDocs, query, collection } from 'firebase/firestore';
import { db } from '../../firebase';

interface EditableCellProps {
  editing: boolean;
  dataIndex: string;
  title: string;
  record: any;
  index: number;
  editable: boolean;
  children: React.ReactNode;
  schema?: RJSFSchema;
  handleSave: (record: any) => void;
  onDoubleClick: () => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  editable,
  dataIndex,
  title,
  record,
  index,
  children,
  schema,
  handleSave,
  onDoubleClick,
  ...restProps
}) => {
  const [dynamicOptions, setDynamicOptions] = useState<{ label: string; value: any }[]>([]);
  const property = schema?.properties?.[dataIndex];
  
  useEffect(() => {
    if (editing && property?.tableOptions?.componentType === 'dropdown') {
      // Check for enum values first
      if (property.enum) {
        const enumOptions = property.enum.map(value => ({
          label: String(value),
          value: value
        }));
        setDynamicOptions(enumOptions);
        return;
      }
      
      // Look for static dropdown values in dropdownOptions
      const dropdownValues = property.dropdownOptions?.values;
      if (dropdownValues && Array.isArray(dropdownValues)) {
        setDynamicOptions(dropdownValues);
        return;
      }
      
      // Handle dynamic data source
      const sourceTable = property.dropdownOptions?.sourceTable;
      const labelField = property.dropdownOptions?.labelField;
      const valueField = property.dropdownOptions?.valueField;
      
      if (sourceTable && labelField && valueField) {
        const loadDynamicOptions = async () => {
          try {
            const q = query(collection(db, sourceTable));
            const querySnapshot = await getDocs(q);
            const options = querySnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                label: data[labelField] ? String(data[labelField]) : 'ללא תווית',
                value: data[valueField] !== undefined ? data[valueField] : doc.id
              };
            });
            setDynamicOptions(options);
          } catch (error) {
            console.error('Error loading dropdown options:', error);
          }
        };
        
        loadDynamicOptions();
      }
    }
  }, [editing, property, dataIndex]);

  const getInputComponent = () => {
    if (!property) return <Input />;

    const componentType = property.tableOptions?.componentType || 'text';
    
    switch (componentType) {
      case 'text':
        return <Input />;
      case 'number':
        return <InputNumber style={{ width: '100%' }} />;
      case 'textarea':
        return <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />;
      case 'dropdown':
        if (dynamicOptions && dynamicOptions.length > 0) {
          const isNumericField = property.type === 'number' || property.type === 'integer';
          
          return (
            <Select style={{ width: '100%' }}>
              {dynamicOptions.map((option) => {
                const optionValue = isNumericField && typeof option.value === 'string' 
                  ? Number(option.value) 
                  : option.value;
                  
                return (
                  <Select.Option key={String(option.value)} value={optionValue}>
                    {option.label}
                  </Select.Option>
                );
              })}
            </Select>
          );
        }
        return <Select style={{ width: '100%' }} loading />;
      case 'checkbox':
        return <Checkbox />;
      case 'date':
        return <DatePicker style={{ width: '100%' }} />;
      case 'time':
        return <TimePicker style={{ width: '100%' }} />;
      case 'datetime':
        return <DatePicker showTime style={{ width: '100%' }} />;
      case 'email':
        return <Input type="email" />;
      case 'tel':
        return <Input type="tel" />;
      case 'url':
        return <Input type="url" />;
      case 'password':
        return <Input.Password />;
      case 'radio':
        return (
          <Select style={{ width: '100%' }}>
            {property.enum?.map((value) => (
              <Select.Option key={value} value={value}>
                {value}
              </Select.Option>
            ))}
          </Select>
        );
      case 'file':
      case 'image':
        return <Input disabled placeholder="עריכה מתאפשרת בטופס המלא" />;
      default:
        return <Input />;
    }
  };

  return (
    <td {...restProps} onDoubleClick={onDoubleClick}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: schema?.required?.includes(dataIndex) ?? false,
              message: `נא להזין ${title}`,
            },
          ]}
          valuePropName={property?.tableOptions?.componentType === 'checkbox' || property?.type === 'boolean' ? 'checked' : 'value'}
        >
          {getInputComponent()}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};