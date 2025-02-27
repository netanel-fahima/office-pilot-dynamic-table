import React from 'react';
import { Form, Input, Select, Switch, InputNumber, Button, Space, Divider } from 'antd';
import type { SchemaConfig } from '../../types/schema';

interface ColumnFormProps {
  form: any;
  showDropdownOptions: boolean;
  schemas: SchemaConfig[];
  onComponentTypeChange: (value: string) => void;
}

export const ColumnForm: React.FC<ColumnFormProps> = ({
  form,
  showDropdownOptions,
  schemas,
  onComponentTypeChange,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
    >
      <Form.Item
        name="name"
        label="שם העמודה"
        rules={[{ required: true, message: 'נא להזין שם עמודה' }]}
      >
        <Input placeholder="שם העמודה" />
      </Form.Item>
      
      <Form.Item
        name="title"
        label="כותרת לתצוגה"
        rules={[{ required: true, message: 'נא להזין כותרת' }]}
      >
        <Input placeholder="כותרת העמודה כפי שתוצג למשתמש" />
      </Form.Item>
      
      <Form.Item
        name="type"
        label="סוג נתונים"
        rules={[{ required: true, message: 'נא לבחור סוג נתונים' }]}
      >
        <Select>
          <Select.Option value="string">טקסט (string)</Select.Option>
          <Select.Option value="number">מספר (number)</Select.Option>
          <Select.Option value="integer">מספר שלם (integer)</Select.Option>
          <Select.Option value="boolean">בוליאני (boolean)</Select.Option>
          <Select.Option value="array">מערך (array)</Select.Option>
          <Select.Option value="object">אובייקט (object)</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
      >
        {({ getFieldValue }) => {
          const type = getFieldValue('type');
          
          if (type === 'string') {
            return (
              <Form.Item
                name="format"
                label="פורמט"
              >
                <Select allowClear>
                  <Select.Option value="email">אימייל (email)</Select.Option>
                  <Select.Option value="uri">כתובת URL (uri)</Select.Option>
                  <Select.Option value="date">תאריך (date)</Select.Option>
                  <Select.Option value="time">שעה (time)</Select.Option>
                  <Select.Option value="date-time">תאריך ושעה (date-time)</Select.Option>
                  <Select.Option value="password">סיסמה (password)</Select.Option>
                  <Select.Option value="tel">טלפון (tel)</Select.Option>
                </Select>
              </Form.Item>
            );
          }
          
          return null;
        }}
      </Form.Item>
      
      <Form.Item
        name="required"
        valuePropName="checked"
        label="האם שדה חובה?"
      >
        <Switch />
      </Form.Item>
      
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
      >
        {({ getFieldValue }) => {
          const type = getFieldValue('type');
          
          let defaultValueComponent = <Input placeholder="ערך ברירת מחדל" />;
          
          switch (type) {
            case 'number':
            case 'integer':
              defaultValueComponent = <InputNumber placeholder="ערך ברירת מחדל" style={{ width: '100%' }} />;
              break;
            case 'boolean':
              defaultValueComponent = <Select>
                <Select.Option value={true}>כן</Select.Option>
                <Select.Option value={false}>לא</Select.Option>
              </Select>;
              break;
            case 'array':
            case 'object':
              return null; // Don't show default for complex types
          }
          
          return (
            <Form.Item
              name="default"
              label="ערך ברירת מחדל"
            >
              {defaultValueComponent}
            </Form.Item>
          );
        }}
      </Form.Item>
      
      <Divider>הגדרות תצוגת טבלה</Divider>

      <Form.Item
        name="componentType"
        label="סוג רכיב"
        rules={[{ required: true, message: "נא לבחור סוג רכיב" }]}
      >
        <Select onChange={onComponentTypeChange}>
          <Select.Option value="text">טקסט</Select.Option>
          <Select.Option value="number">מספר</Select.Option>
          <Select.Option value="dropdown">רשימה נפתחת</Select.Option>
          <Select.Option value="checkbox">תיבת סימון</Select.Option>
          <Select.Option value="date">תאריך</Select.Option>
          <Select.Option value="time">שעה</Select.Option>
          <Select.Option value="datetime">תאריך ושעה</Select.Option>
          <Select.Option value="textarea">שדה טקסט מרובה שורות</Select.Option>
          <Select.Option value="email">דואר אלקטרוני</Select.Option>
          <Select.Option value="tel">טלפון</Select.Option>
          <Select.Option value="url">כתובת אינטרנט</Select.Option>
          <Select.Option value="password">סיסמה</Select.Option>
          <Select.Option value="radio">כפתורי רדיו</Select.Option>
          <Select.Option value="file">קובץ</Select.Option>
          <Select.Option value="image">תמונה</Select.Option>
        </Select>
      </Form.Item>

      {showDropdownOptions && (
        <>
          <Form.Item
            name="dropdownOptionsType"
            label="מקור נתונים"
            rules={[{ required: true, message: 'נא לבחור מקור נתונים' }]}
          >
            <Select>
              <Select.Option value="static">הזנת ערכים קבועים</Select.Option>
              <Select.Option value="dynamic">בחירה מטבלה אחרת</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues?.dropdownOptionsType !== currentValues?.dropdownOptionsType
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('dropdownOptionsType') === 'static' ? (
                <Form.List name="dropdownValues">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <Space key={field.name} align="baseline">
                          <Form.Item
                            key={`${field.key}-label`}
                            name={[field.name, 'label']}
                            label={index === 0 ? 'ערכים' : ''}
                            rules={[{ required: true, message: 'נא להזין תווית' }]}
                          >
                            <Input placeholder="תווית" />
                          </Form.Item>
                          <Form.Item
                            key={`${field.key}-value`}
                            name={[field.name, 'value']}
                            rules={[{ required: true, message: 'נא להזין ערך' }]}
                          >
                            <Input placeholder="ערך" />
                          </Form.Item>
                          <Button type="text" danger onClick={() => remove(field.name)}>
                            מחק
                          </Button>
                        </Space>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block>
                          הוסף ערך
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              ) : getFieldValue('dropdownOptionsType') === 'dynamic' ? (
                <>
                  <Form.Item
                    name="sourceTable"
                    label="טבלת מקור"
                    rules={[{ required: true, message: 'נא לבחור את הטבלה ממנה יילקחו הערכים' }]}
                  >
                    <Select>
                      {schemas.map(schema => (
                        <Select.Option key={schema.id} value={schema.tableName}>
                          {schema.title || schema.tableName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="labelField"
                    label="שדה תווית"
                    rules={[{ required: true, message: 'נא להזין את שם השדה שיוצג ברשימה' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="valueField"
                    label="שדה ערך"
                    rules={[{ required: true, message: 'נא להזין את שם השדה שישמש כערך' }]}
                  >
                    <Input />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
        </>
      )}
      
      <Form.Item
        name="width"
        label="רוחב העמודה (פיקסלים)"
      >
        <InputNumber min={30} style={{ width: '100%' }} />
      </Form.Item>
      
      <Form.Item
        name="sortable"
        valuePropName="checked"
        label="האם ניתן למיין?"
      >
        <Switch />
      </Form.Item>
      
      <Form.Item
        name="filterable"
        valuePropName="checked"
        label="האם ניתן לסנן?"
      >
        <Switch />
      </Form.Item>
      
      <Form.Item
        name="hidden"
        valuePropName="checked"
        label="האם להסתיר בטבלה?"
      >
        <Switch />
      </Form.Item>
      
      <Form.Item
        name="addable"
        valuePropName="checked"
        label="ניתן להוספה בטופס?"
        initialValue={true}
      >
        <Switch defaultChecked />
      </Form.Item>
    </Form>
  );
};