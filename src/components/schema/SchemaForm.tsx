import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Tabs, Divider, Space, Alert, Card } from 'antd';
import { Save } from 'lucide-react';
import { DynamicJsonForm } from '../DynamicJsonForm';
import type { SchemaConfig } from '../../types/schema';

interface SchemaFormProps {
  form: any;
  isEditing: boolean;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  rawSchema: string;
  setRawSchema: (schema: string) => void;
  rawUiSchema: string;
  setRawUiSchema: (schema: string) => void;
  formPreviewData: any;
  setFormPreviewData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onPreview: () => void;
}

const PREVIEW_TAB = 'preview';

export const SchemaForm: React.FC<SchemaFormProps> = ({
  form,
  isEditing,
  currentTab,
  setCurrentTab,
  rawSchema,
  setRawSchema,
  rawUiSchema,
  setRawUiSchema,
  formPreviewData,
  setFormPreviewData,
  onSave,
  onCancel,
  onPreview,
}) => {
  const [previewError, setPreviewError] = useState<string | null>(null);

  // עדכון אוטומטי של התצוגה המקדימה בעת מעבר ללשונית התצוגה המקדימה
  useEffect(() => {
    if (currentTab === PREVIEW_TAB) {
      try {
        const schema = JSON.parse(rawSchema);
        const uiSchema = JSON.parse(rawUiSchema);
        setFormPreviewData({ schema, uiSchema });
        setPreviewError(null);
      } catch (error) {
        setPreviewError('שגיאת פרסור ב-JSON. נא לבדוק את הפורמט.');
        setFormPreviewData(null);
      }
    }
  }, [currentTab, rawSchema, rawUiSchema]);

  return (
    <Tabs
      activeKey={currentTab}
      onChange={setCurrentTab}
      items={[
        {
          key: 'base',
          label: 'הגדרות בסיסיות',
          children: (
            <Form
              form={form}
              layout="vertical"
              initialValues={{ tableName: '', title: '' }}
            >
              <Form.Item
                name="tableName"
                label="שם הטבלה"
                rules={[{ required: true, message: 'שדה חובה' }]}
              >
                <Input placeholder="שם הטבלה בבסיס הנתונים (באנגלית)" disabled={isEditing} />
              </Form.Item>
              <Form.Item
                name="title"
                label="כותרת"
                rules={[{ required: true, message: 'שדה חובה' }]}
              >
                <Input placeholder="כותרת הטבלה (לתצוגה)" />
              </Form.Item>
            </Form>
          ),
        },
        {
          key: 'schema',
          label: 'סכמה',
          children: (
            <Space direction="vertical" style={{ width: '100%' }}>
              <p className="mb-2">הגדרת מבנה הנתונים (Schema):</p>
              <Input.TextArea
                value={rawSchema}
                onChange={(e) => setRawSchema(e.target.value)}
                autoSize={{ minRows: 15, maxRows: 20 }}
                style={{ fontFamily: 'monospace' }}
              />
              <Space>
                <Button onClick={() => {
                  try {
                    const formatted = JSON.stringify(JSON.parse(rawSchema), null, 2);
                    setRawSchema(formatted);
                  } catch (error) {
                    // אם יש שגיאת פרסור, לא נעשה כלום
                  }
                }}>
                  סדר אוטומטי
                </Button>
                <Button onClick={() => setCurrentTab(PREVIEW_TAB)}>
                  תצוגה מקדימה
                </Button>
              </Space>
            </Space>
          ),
        },
        {
          key: 'uiSchema',
          label: 'תצוגה',
          children: (
            <Space direction="vertical" style={{ width: '100%' }}>
              <p className="mb-2">הגדרת ממשק משתמש (UI Schema):</p>
              <Input.TextArea
                value={rawUiSchema}
                onChange={(e) => setRawUiSchema(e.target.value)}
                autoSize={{ minRows: 15, maxRows: 20 }}
                style={{ fontFamily: 'monospace' }}
              />
              <Space>
                <Button onClick={() => {
                  try {
                    const formatted = JSON.stringify(JSON.parse(rawUiSchema), null, 2);
                    setRawUiSchema(formatted);
                  } catch (error) {
                    // אם יש שגיאת פרסור, לא נעשה כלום
                  }
                }}>
                  סדר אוטומטי
                </Button>
                <Button onClick={() => setCurrentTab(PREVIEW_TAB)}>
                  תצוגה מקדימה
                </Button>
              </Space>
            </Space>
          ),
        },
        {
          key: 'preview',
          label: 'תצוגה מקדימה',
          children: (
            <Space direction="vertical" style={{ width: '100%' }}>
              {previewError ? (
                <Alert
                  message="שגיאה"
                  description={previewError}
                  type="error"
                  showIcon
                />
              ) : formPreviewData ? (
                <div>
                  <div className="mb-4">
                    <Alert
                      message="תצוגה מקדימה"
                      description="זוהי תצוגה מקדימה של הטופס. כל שינוי בסכמה או ב-UI Schema יתעדכן כאן אוטומטית."
                      type="info"
                      showIcon
                    />
                  </div>
                  <Card>
                    <DynamicJsonForm
                      schemaConfig={{
                        id: 'preview',
                        tableName: form.getFieldValue('tableName') || 'preview',
                        schema: formPreviewData.schema,
                        uiSchema: formPreviewData.uiSchema,
                      }}
                      onSubmit={() => {}}
                    />
                  </Card>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <Alert
                    message="אין תצוגה מקדימה"
                    description="נא להזין סכמה תקינה כדי לראות תצוגה מקדימה של הטופס"
                    type="warning"
                    showIcon
                  />
                </div>
              )}
            </Space>
          ),
        },
      ]}
    />
  );
};