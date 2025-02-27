import React, { useState } from 'react';
import { Table, Form, Card, message, Space, Dropdown, Button } from 'antd';
import { collection, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { db } from '../firebase';
import type { SchemaConfig, TableAction } from '../types/schema';
import { useSchema } from '../hooks/useSchema';
import { useFirestore } from '../hooks/useFirestore';
import { cleanForFirestore, processValueForSave } from '../utils/firestore';
import { Edit, Trash2, Save, Download, FileSpreadsheet } from 'lucide-react';
import { EditableCell } from './table/EditableCell';
import { TableHeader } from './table/TableHeader';
import { ColumnSelector } from './table/ColumnSelector';
import { FormModal } from './table/FormModal';
import { MoreHorizontal } from 'lucide-react';

interface DynamicTableProps {
  tableName: string;
  title: string;
  readOnly?: boolean;
  pagination?: {
    enabled?: boolean;
    pageSize?: number;
    showSizeChanger?: boolean;
  };
  search?: {
    enabled?: boolean;
    placeholder?: string;
  };
  columnSettings?: {
    enabled?: boolean;
    buttonText?: string;
  };
  export?: {
    enabled?: boolean;
    buttonText?: string;
    formats?: ('csv' | 'excel')[];
  };
  actions?: {
    add?: boolean;
    edit?: boolean;
    delete?: boolean;
    addButtonText?: string;
    icons?: {
      edit?: React.ReactNode;
      delete?: React.ReactNode;
      save?: React.ReactNode;
      cancel?: React.ReactNode;
    };
  };
  customActions?: TableAction[];
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  tableName,
  title,
  readOnly = false,
  pagination = {
    enabled: true,
    pageSize: 10,
    showSizeChanger: true,
  },
  search = {
    enabled: true,
    placeholder: 'חיפוש...',
  },
  columnSettings = {
    enabled: true,
    buttonText: 'הגדרת עמודות',
  },
  export: exportOptions = {
    enabled: true,
    buttonText: 'ייצוא',
    formats: ['excel', 'csv'],
  },
  actions = {
    add: true,
    edit: true,
    delete: true,
    addButtonText: 'הוסף רשומה',
    icons: {
      edit: <Edit className="w-4 h-4" />,
      delete: <Trash2 className="w-4 h-4" />,
      save: <Save className="w-4 h-4" />,
      cancel: null,
    },
  },
  customActions = [],
}) => {
  const [form] = Form.useForm();
  const { schema: schemaConfig, loading: schemaLoading } = useSchema(tableName);
  const { data, loading: dataLoading } = useFirestore(tableName);
  const [editingKey, setEditingKey] = useState<string>('');
  const [filteredInfo, setFilteredInfo] = useState<Record<string, string[]>>({});
  const [searchText, setSearchText] = useState('');
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  React.useEffect(() => {
    if (schemaConfig) {
      // קבלת הסדר מ-ui:order
      const uiOrder = schemaConfig.uiSchema?.['ui:order'] || [];
      const allProperties = Object.keys(schemaConfig.schema.properties);
      
      // יצירת מערך סופי של העמודות בסדר הנכון
      const initialColumns = [
        // קודם כל העמודות מ-ui:order שקיימות ב-properties ולא מוסתרות
        ...uiOrder.filter(key => 
          allProperties.includes(key) && 
          !schemaConfig.schema.properties[key].tableOptions?.hidden
        ),
        // אחר כך כל העמודות שלא נמצאות ב-ui:order ולא מוסתרות
        ...allProperties.filter(key => 
          !uiOrder.includes(key) && 
          !schemaConfig.schema.properties[key].tableOptions?.hidden
        )
      ];
      
      setVisibleColumns(initialColumns);
    }
  }, [schemaConfig]);

  const isEditing = (record: any) => record.id === editingKey;

  const edit = (record: any) => {
    form.resetFields();
    const formValues = Object.keys(record).reduce((acc, key) => {
      if (key !== 'id' && key !== 'createdDate' && key !== 'lastModifiedDate' && key !== 'version') {
        acc[key] = record[key];
      }
      return acc;
    }, {} as Record<string, any>);
    form.setFieldsValue(formValues);
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (record: any) => {
    try {
      const row = await form.validateFields();
      
      if (!schemaConfig) {
        throw new Error('הגדרות הטבלה לא נטענו');
      }
      
      const cleanedData: Record<string, any> = {};
      
      Object.entries(schemaConfig.schema.properties).forEach(([key, prop]) => {
        if (row.hasOwnProperty(key)) {
          cleanedData[key] = processValueForSave(row[key], key, schemaConfig.schema);
        } else {
          switch (prop.type) {
            case 'string':
              cleanedData[key] = '';
              break;
            case 'number':
            case 'integer':
              cleanedData[key] = 0;
              break;
            case 'boolean':
              cleanedData[key] = false;
              break;
            case 'array':
              cleanedData[key] = [];
              break;
            case 'object':
              cleanedData[key] = {};
              break;
            default:
              cleanedData[key] = null;
          }
        }
      });

      const updatedItem = {
        ...cleanedData,
        lastModifiedDate: new Date().toISOString(),
        version: (record.version || 0) + 1
      };

      const finalData = cleanForFirestore(updatedItem);

      const docRef = doc(db, tableName, record.id);
      await updateDoc(docRef, finalData);
      
      setEditingKey('');
      message.success('הרשומה עודכנה בהצלחה');
    } catch (error) {
      console.error('Error saving record:', error);
      message.error('שגיאה בשמירת הרשומה');
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteDoc(doc(db, tableName, key));
      message.success('הרשומה נמחקה בהצלחה');
    } catch (error) {
      console.error('Error deleting record:', error);
      message.error('שגיאה במחיקת הרשומה');
    }
  };

  const handleFormSubmit = async ({ formData }: { formData: any }) => {
    try {
      if (!schemaConfig) {
        throw new Error('הגדרות הטבלה לא נטענו');
      }
      
      const cleanedData: Record<string, any> = {};
      
      Object.entries(schemaConfig.schema.properties).forEach(([key, prop]) => {
        if (formData.hasOwnProperty(key)) {
          cleanedData[key] = processValueForSave(formData[key], key, schemaConfig.schema);
        } else {
          switch (prop.type) {
            case 'string':
              cleanedData[key] = '';
              break;
            case 'number':
            case 'integer':
              cleanedData[key] = 0;
              break;
            case 'boolean':
              cleanedData[key] = false;
              break;
            case 'array':
              cleanedData[key] = [];
              break;
            case 'object':
              cleanedData[key] = {};
              break;
            default:
              cleanedData[key] = null;
          }
        }
      });

      if (editingRecord) {
        const updatedItem = {
          ...cleanedData,
          lastModifiedDate: new Date().toISOString(),
          version: (editingRecord.version || 0) + 1
        };

        const finalData = cleanForFirestore(updatedItem);
        await updateDoc(doc(db, tableName, editingRecord.id), finalData);
        message.success('הרשומה עודכנה בהצלחה');
      } else {
        const newRecord = {
          ...cleanedData,
          createdDate: new Date().toISOString(),
          lastModifiedDate: new Date().toISOString(),
          version: 0
        };

        const finalData = cleanForFirestore(newRecord);
        const docRef = doc(collection(db, tableName));
        await setDoc(docRef, finalData);
        message.success('רשומה חדשה נוצרה בהצלחה');
      }
      
      setIsFormModalOpen(false);
    } catch (error) {
      console.error('Error saving record:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('שגיאה בשמירת הרשומה');
      }
    }
  };

  const handleExport = (format: 'csv' | 'excel') => {
    try {
      const exportData = filteredData.map(record => {
        const row: Record<string, any> = {};
        visibleColumns.forEach(key => {
          const prop = schemaConfig?.schema?.properties?.[key];
          if (prop) {
            row[prop.title || key] = renderCellValue(record[key], key);
          }
        });
        return row;
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Data');

      if (format === 'csv') {
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `${tableName}_export.csv`);
      } else {
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${tableName}_export.xlsx`);
      }

      message.success('הנתונים יוצאו בהצלחה');
    } catch (error) {
      console.error('Error exporting data:', error);
      message.error('שגיאה בייצוא הנתונים');
    }
  };

  // Helper function to render cell values based on component type
  const renderCellValue = (value: any, columnKey: string) => {
    if (value === undefined || value === null) return '-';
    
    const property = schemaConfig?.schema?.properties?.[columnKey];
    if (!property) return String(value);
    
    const componentType = property.tableOptions?.componentType || '';
    
    switch (componentType) {
      case 'checkbox':
      case 'boolean':
        return value ? 'כן' : 'לא';
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-';
      case 'time':
        return value ? new Date(value).toLocaleTimeString() : '-';
      case 'datetime':
        return value ? new Date(value).toLocaleString() : '-';
      case 'dropdown':
        if (property.dropdownOptions?.values) {
          const option = property.dropdownOptions.values.find(opt => {
            if (property.type === 'number' || property.type === 'integer') {
              return Number(opt.value) === Number(value);
            }
            return String(opt.value) === String(value);
          });
          
          if (option) return option.label;
        }
        return String(value);
      default:
        return String(value);
    }
  };

  const getTableColumns = () => {
    if (!schemaConfig) return [];

    // יצירת העמודות לפי סדר visibleColumns
    const columns = visibleColumns.map(key => {
      const prop = schemaConfig.schema.properties[key];
      return {
        title: prop.title || key,
        dataIndex: key,
        key,
        width: prop.tableOptions?.width,
        ellipsis: prop.tableOptions?.ellipsis,
        fixed: prop.tableOptions?.fixed,
        sorter: prop.tableOptions?.sortable ? (a: any, b: any) => {
          const aVal = a[key];
          const bVal = b[key];
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return aVal.localeCompare(bVal);
          }
          return aVal - bVal;
        } : undefined,
        filteredValue: filteredInfo[key] || null,
        onFilter: (value: string | number | boolean, record: any) =>
          record[key]?.toString().toLowerCase().includes(value.toString().toLowerCase()),
        editable: true,
        render: (value: any) => renderCellValue(value, key),
      };
    });

    columns.push({
      title: 'פעולות',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return (
          <Space size="small">
            <Dropdown
              menu={{
                items: [
                  ...(actions.edit ? [{
                    key: 'edit',
                    label: 'עריכה',
                    icon: actions.icons?.edit,
                    onClick: () => handleEdit(record),
                    disabled: readOnly,
                  }] : []),
                  ...(actions.delete ? [{
                    key: 'delete',
                    label: 'מחיקה',
                    icon: actions.icons?.delete,
                    danger: true,
                    onClick: () => handleDelete(record.id),
                    disabled: readOnly,
                  }] : []),
                  ...customActions.map(action => ({
                    key: action.key,
                    label: action.label,
                    icon: action.icon,
                    danger: action.danger,
                    onClick: () => action.onClick(record),
                    ...(action.confirm && {
                      popconfirm: {
                        title: action.confirm.title,
                        description: action.confirm.content,
                      }
                    })
                  }))
                ]
              }}
              trigger={['click']}
            >
              <Button
                type="text"
                icon={<MoreHorizontal className="w-4 h-4" />}
                disabled={editingKey !== ''}
              />
            </Dropdown>
            {editable && (
              <Space>
                <Space size="small">
                  <Button
                    type="text"
                    icon={actions.icons?.save}
                    onClick={() => save(record)}
                  />
                  <Button
                    type="text"
                    icon={actions.icons?.cancel}
                    onClick={cancel}
                  >
                    ביטול
                  </Button>
                </Space>
              </Space>
            )}
          </Space>
        );
      },
    });

    return columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: any) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          editing: isEditing(record),
          schema: schemaConfig?.schema,
          handleSave: save,
          onDoubleClick: () => {
            if (!isEditing(record)) {
              edit(record);
            }
          }
        }),
      };
    });
  };

  const handleTableChange = (_: any, filters: any) => {
    setFilteredInfo(filters);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Filter data based on search text
  const filteredData = searchText
    ? data.filter(item => {
        return visibleColumns.some(columnKey => {
          const value = item[columnKey];
          return value !== undefined && value !== null && 
            String(value).toLowerCase().includes(searchText.toLowerCase());
        });
      })
    : data;

  if (!schemaConfig) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1400px] mx-auto">
        <Card>
          <TableHeader
            search={search}
            columnSettings={columnSettings}
            export={exportOptions}
            onExport={handleExport}
            title={title}
            onColumnSettingsClick={columnSettings.enabled ? () => setIsColumnSelectorOpen(true) : undefined}
            searchText={searchText}
            addButtonText={actions.addButtonText}
            onSearchChange={handleSearch}
            onAdd={!readOnly && actions.add ? handleAdd : undefined}
          />

          <Form form={form} component={false}>
            <Table
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              bordered
              dataSource={filteredData}
              columns={getTableColumns()}
              rowKey="id"
              onChange={handleTableChange}
              loading={schemaLoading || dataLoading}
              rowClassName={record => isEditing(record) ? 'editing-row' : ''}
              scroll={{ x: 'max-content' }}
              pagination={
                pagination.enabled
                  ? {
                      pageSize: pagination.pageSize,
                      showSizeChanger: pagination.showSizeChanger,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} מתוך ${total} רשומות`,
                    }
                  : false
              }
            />
          </Form>

          <ColumnSelector
            isOpen={isColumnSelectorOpen}
            onClose={() => setIsColumnSelectorOpen(false)}
            schema={schemaConfig}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
          />

          <FormModal
            isOpen={isFormModalOpen}
            onClose={() => {
              setIsFormModalOpen(false);
              setEditingRecord(null);
            }}
            schemaConfig={schemaConfig}
            editingRecord={editingRecord}
            onSubmit={handleFormSubmit}
          />
        </Card>
      </div>
    </div>
  );
};

export default DynamicTable;