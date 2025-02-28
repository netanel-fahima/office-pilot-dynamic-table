import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Modal,
  Form,
  Tooltip,
  Drawer,
} from "antd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Plus,
  Edit,
  Trash2,
  Settings2,
  ChevronDown,
  ChevronUp,
  Columns,
  Save,
  GripVertical,
} from "lucide-react";
import type { SchemaConfig } from "../types/schema";
import { SchemaForm } from "./schema/SchemaForm";
import { ColumnForm } from "./schema/ColumnForm";
import { cleanForFirestore } from "../utils/firestore";
import { useFirestore } from "../hooks/useFirestore";

export default function SchemaManager() {
  const { data: schemas, loading } = useFirestore("schemas");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSchema, setCurrentSchema] = useState<SchemaConfig | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("base");
  const [form] = Form.useForm();
  const [columnForm] = Form.useForm();
  const [formPreviewData, setFormPreviewData] = useState<any>(null);

  // State for raw schema editing
  const [rawSchema, setRawSchema] = useState<string>("");
  const [rawUiSchema, setRawUiSchema] = useState<string>("");

  // Expanded rows
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  // Column drawer
  const [isColumnDrawerOpen, setIsColumnDrawerOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [parentSchemaId, setParentSchemaId] = useState<string | null>(null);
  const [showDropdownOptions, setShowDropdownOptions] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "schemas", id));
      message.success("הסכמה נמחקה בהצלחה");
    } catch (error) {
      console.error("Error deleting schema:", error);
      message.error("שגיאה במחיקת הסכמה");
    }
  };

  const handleEdit = (schema: SchemaConfig) => {
    setCurrentSchema(schema);
    setIsEditing(true);
    form.setFieldsValue({
      tableName: schema.tableName,
      title: schema.title || "",
    });
    setRawSchema(JSON.stringify(schema.schema, null, 2));
    setRawUiSchema(JSON.stringify(schema.uiSchema || {}, null, 2));
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentSchema(null);
    setIsEditing(false);
    form.resetFields();

    // Set default schema
    const defaultSchema = {
      type: "object",
      required: [],
      properties: {
        name: {
          type: "string",
          title: "שם",
          tableOptions: {
            width: 150,
            sortable: true,
            filterable: true,
          },
        },
        email: {
          type: "string",
          format: "email",
          title: "אימייל",
          tableOptions: {
            width: 200,
            sortable: true,
            filterable: true,
          },
        },
        phone: {
          type: "string",
          title: "טלפון",
          tableOptions: {
            width: 120,
            sortable: true,
          },
        },
        isActive: {
          type: "boolean",
          title: "פעיל",
          default: true,
          tableOptions: {
            width: 80,
            sortable: true,
            filterable: true,
          },
        },
      },
    };

    const defaultUiSchema = {
      "ui:order": ["name", "email", "phone", "isActive"],
      name: {
        "ui:placeholder": "הכנס שם מלא",
        "ui:autofocus": true,
      },
      email: {
        "ui:placeholder": "example@domain.com",
      },
      phone: {
        "ui:placeholder": "050-0000000",
      },
    };

    setRawSchema(JSON.stringify(defaultSchema, null, 2));
    setRawUiSchema(JSON.stringify(defaultUiSchema, null, 2));
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      let parsedSchema;
      let parsedUiSchema;

      try {
        parsedSchema = JSON.parse(rawSchema);
        parsedUiSchema = JSON.parse(rawUiSchema);
      } catch (e) {
        message.error("שגיאת פרסור ב-JSON. נא לבדוק את הפורמט.");
        return;
      }

      // Validate schema structure
      if (parsedSchema.type !== "object" || !parsedSchema.properties) {
        message.error(
          'מבנה סכמה לא תקין. הסכמה חייבת להיות מסוג "object" עם מאפיין "properties".'
        );
        return;
      }

      const newSchema: SchemaConfig = {
        id: currentSchema?.id || doc(collection(db, "schemas")).id,
        tableName: values.tableName,
        title: values.title || values.tableName,
        schema: parsedSchema,
        uiSchema: parsedUiSchema,
        updatedAt: new Date().toISOString(),
        version: (currentSchema?.version || 0) + 1,
      };

      // Clean the object for Firestore
      const cleanedSchema = cleanForFirestore(newSchema);

      if (isEditing && currentSchema) {
        await updateDoc(doc(db, "schemas", currentSchema.id), cleanedSchema);
        message.success("הסכמה עודכנה בהצלחה");
      } else {
        await setDoc(doc(db, "schemas", newSchema.id), cleanedSchema);
        message.success("הסכמה נוצרה בהצלחה");
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving schema:", error);
      if (error instanceof Error) {
        message.error(`שגיאה בשמירת הסכמה: ${error.message}`);
      } else {
        message.error("שגיאה בשמירת הסכמה");
      }
    }
  };

  const updateFormPreview = () => {
    try {
      const schema = JSON.parse(rawSchema);
      setFormPreviewData({
        schema,
        uiSchema: JSON.parse(rawUiSchema),
      });
    } catch (e) {
      message.error("שגיאת פרסור ב-JSON. לא ניתן להציג תצוגה מקדימה.");
    }
  };

  const handleComponentTypeChange = (value: string) => {
    setShowDropdownOptions(value === "dropdown");

    if (value !== "dropdown") {
      columnForm.setFieldsValue({
        dropdownOptionsType: undefined,
        dropdownValues: undefined,
        sourceTable: undefined,
        labelField: undefined,
        valueField: undefined,
      });
    }
  };

  const openColumnDrawer = (schemaId: string, columnName?: string) => {
    setParentSchemaId(schemaId);
    const schema = schemas.find((s) => s.id === schemaId);
    if (!schema) return;

    if (columnName) {
      setEditingColumn(columnName);
      const columnData = schema.schema.properties[columnName];

      const componentType = columnData.tableOptions?.componentType || "";
      setShowDropdownOptions(componentType === "dropdown");

      columnForm.setFieldsValue({
        name: columnName,
        title: columnData.title || columnName,
        type: columnData.type,
        addable: columnData.addable !== false,
        format: columnData.format || undefined,
        required: schema.schema.required?.includes(columnName) || false,
        default: columnData.default,
        width: columnData.tableOptions?.width,
        sortable: columnData.tableOptions?.sortable || false,
        filterable: columnData.tableOptions?.filterable || false,
        hidden: columnData.tableOptions?.hidden || false,
        componentType: columnData.tableOptions?.componentType || "text",
        ...(componentType === "dropdown" &&
          columnData.dropdownOptions && {
            dropdownOptionsType: columnData.dropdownOptions.sourceTable
              ? "dynamic"
              : "static",
            ...(columnData.dropdownOptions.sourceTable
              ? {
                  sourceTable: columnData.dropdownOptions.sourceTable,
                  labelField: columnData.dropdownOptions.labelField,
                  valueField: columnData.dropdownOptions.valueField,
                }
              : {
                  dropdownValues: columnData.dropdownOptions.values,
                }),
          }),
      });
    } else {
      setEditingColumn(null);
      columnForm.resetFields();
      columnForm.setFieldsValue({
        type: "string",
        required: false,
        sortable: true,
        filterable: false,
        hidden: false,
        componentType: "text",
      });
      setShowDropdownOptions(false);
    }

    setIsColumnDrawerOpen(true);
  };

  const saveColumn = async () => {
    try {
      const values = await columnForm.validateFields();
      if (!parentSchemaId) return;

      const schema = schemas.find((s) => s.id === parentSchemaId);
      if (!schema) return;

      const updatedSchema = JSON.parse(JSON.stringify(schema));
      const oldColumnName = editingColumn;
      const newColumnName = values.name;

      const columnConfig = {
        type: values.type,
        title: values.title,
        addable: values.addable,
        tableOptions: {
          width: values.width,
          sortable: values.sortable,
          filterable: values.filterable,
          hidden: values.hidden,
          componentType: values.componentType,
        },
      };

      if (values.format) {
        columnConfig.format = values.format;
      }

      if (values.default !== undefined && values.default !== "") {
        switch (values.type) {
          case "number":
          case "integer":
            columnConfig.default = Number(values.default);
            break;
          case "boolean":
            columnConfig.default = Boolean(values.default);
            break;
          default:
            columnConfig.default = values.default;
        }
      }

      if (values.componentType === "dropdown") {
        const dropdownOptions = {};

        if (values.dropdownOptionsType === "static" && values.dropdownValues) {
          dropdownOptions.values = values.dropdownValues;
        } else if (values.dropdownOptionsType === "dynamic") {
          dropdownOptions.sourceTable = values.sourceTable;
          dropdownOptions.labelField = values.labelField;
          dropdownOptions.valueField = values.valueField;
        }

        columnConfig.dropdownOptions = dropdownOptions;
      }

      if (oldColumnName && oldColumnName !== newColumnName) {
        const newProperties = {};

        Object.entries(updatedSchema.schema.properties).forEach(
          ([key, value]) => {
            if (key !== oldColumnName) {
              newProperties[key] = value;
            }
          }
        );

        newProperties[newColumnName] = columnConfig;
        updatedSchema.schema.properties = newProperties;

        if (updatedSchema.schema.required?.includes(oldColumnName)) {
          updatedSchema.schema.required = updatedSchema.schema.required.filter(
            (name) => name !== oldColumnName
          );
          if (values.required) {
            updatedSchema.schema.required.push(newColumnName);
          }
        } else if (values.required) {
          updatedSchema.schema.required = [
            ...(updatedSchema.schema.required || []),
            newColumnName,
          ];
        }

        if (updatedSchema.uiSchema) {
          if (updatedSchema.uiSchema["ui:order"]) {
            updatedSchema.uiSchema["ui:order"] = updatedSchema.uiSchema[
              "ui:order"
            ].map((item: string) =>
              item === oldColumnName ? newColumnName : item
            );
          }

          if (updatedSchema.uiSchema[oldColumnName]) {
            updatedSchema.uiSchema[newColumnName] =
              updatedSchema.uiSchema[oldColumnName];
            delete updatedSchema.uiSchema[oldColumnName];
          }
        }
      } else {
        updatedSchema.schema.properties[newColumnName] = columnConfig;

        const isCurrentlyRequired =
          updatedSchema.schema.required?.includes(newColumnName) || false;
        if (values.required && !isCurrentlyRequired) {
          updatedSchema.schema.required = [
            ...(updatedSchema.schema.required || []),
            newColumnName,
          ];
        } else if (!values.required && isCurrentlyRequired) {
          updatedSchema.schema.required = updatedSchema.schema.required.filter(
            (name) => name !== newColumnName
          );
        }
      }

      updatedSchema.version = (updatedSchema.version || 0) + 1;
      updatedSchema.updatedAt = new Date().toISOString();

      const cleanedSchema = cleanForFirestore(updatedSchema);

      await updateDoc(doc(db, "schemas", parentSchemaId), cleanedSchema);

      message.success(
        `העמודה ${newColumnName} ${editingColumn ? "עודכנה" : "נוספה"} בהצלחה`
      );
      setIsColumnDrawerOpen(false);

      if (!expandedRowKeys.includes(parentSchemaId)) {
        setExpandedRowKeys([...expandedRowKeys, parentSchemaId]);
      }
    } catch (error) {
      console.error("Error saving column:", error);
      if (error instanceof Error) {
        message.error(`שגיאה בשמירת העמודה: ${error.message}`);
      } else {
        message.error("שגיאה בשמירת העמודה");
      }
    }
  };

  const deleteColumn = async (schemaId: string, columnName: string) => {
    try {
      const schema = schemas.find((s) => s.id === schemaId);
      if (!schema) return;

      const updatedSchema = JSON.parse(JSON.stringify(schema));

      const newProperties = {};
      Object.entries(updatedSchema.schema.properties).forEach(
        ([key, value]) => {
          if (key !== columnName) {
            newProperties[key] = value;
          }
        }
      );

      updatedSchema.schema.properties = newProperties;

      if (updatedSchema.schema.required?.includes(columnName)) {
        updatedSchema.schema.required = updatedSchema.schema.required.filter(
          (name) => name !== columnName
        );
      }

      if (updatedSchema.uiSchema) {
        if (updatedSchema.uiSchema["ui:order"]) {
          updatedSchema.uiSchema["ui:order"] = updatedSchema.uiSchema[
            "ui:order"
          ].filter((item: string) => item !== columnName);
        }

        if (updatedSchema.uiSchema[columnName]) {
          delete updatedSchema.uiSchema[columnName];
        }
      }

      updatedSchema.version = (updatedSchema.version || 0) + 1;
      updatedSchema.updatedAt = new Date().toISOString();

      const cleanedSchema = cleanForFirestore(updatedSchema);

      await updateDoc(doc(db, "schemas", schemaId), cleanedSchema);

      message.success(`העמודה ${columnName} נמחקה בהצלחה`);
    } catch (error) {
      console.error("Error deleting column:", error);
      if (error instanceof Error) {
        message.error(`שגיאה במחיקת העמודה: ${error.message}`);
      } else {
        message.error("שגיאה במחיקת העמודה");
      }
    }
  };

  const getColumnsData = (schema: SchemaConfig) => {
    if (!schema.schema.properties) return [];

    // קבלת הסדר מ-ui:order או יצירת סדר מהמאפיינים
    const order = schema.uiSchema?.["ui:order"] || [];
    const allKeys = Object.keys(schema.schema.properties);

    // יצירת מערך סופי שכולל את כל המפתחות בסדר הנכון
    const finalOrder = [
      // קודם כל המפתחות מ-ui:order שקיימים ב-properties
      ...order.filter((key) => allKeys.includes(key)),
      // אחר כך כל המפתחות שלא נמצאים ב-ui:order
      ...allKeys.filter((key) => !order.includes(key)),
    ];

    // מיפוי לפי הסדר הסופי
    return finalOrder.map((key) => {
      const prop = schema.schema.properties[key];
      const isRequired = schema.schema.required?.includes(key) || false;

      return {
        key,
        name: key,
        title: prop.title || key,
        type: prop.type,
        format: prop.format,
        componentType: prop.tableOptions?.componentType || "text",
        required: isRequired,
        tableOptions: prop.tableOptions,
        dropdownOptions: prop.dropdownOptions,
        parentId: schema.id,
      };
    });
  };

  const expandableConfig = {
    expandedRowKeys,
    onExpandedRowsChange: (expandedRows: React.Key[]) => {
      setExpandedRowKeys(expandedRows as string[]);
    },
    expandedRowRender: (record: SchemaConfig) => {
      const columnsData = Object.entries(record.schema.properties).map(
        ([key, prop]) => {
          const isRequired = record.schema.required?.includes(key) || false;
          return {
            id: `column-${key}`,
            name: key,
            title: prop.title || key,
            type: prop.type,
            format: prop.format,
            componentType: prop.tableOptions?.componentType || "text",
            required: isRequired,
            tableOptions: prop.tableOptions,
            dropdownOptions: prop.dropdownOptions,
            parentId: record.id,
            hidden: prop.tableOptions?.hidden || false,
            addable: prop.addable,
          };
        }
      );

      const nestedColumns = [
        {
          title: "שם",
          dataIndex: "name",
          key: "name",
          width: 150,
        },
        {
          title: "כותרת",
          dataIndex: "title",
          key: "title",
          width: 150,
        },
        {
          title: "סוג",
          dataIndex: "type",
          key: "type",
          width: 100,
          render: (text: string, record: any) => {
            if (record.format) {
              return `${text} (${record.format})`;
            }
            return text;
          },
        },
        {
          title: "סוג רכיב",
          dataIndex: "componentType",
          key: "componentType",
          width: 100,
        },
        {
          title: "חובה",
          dataIndex: "required",
          key: "required",
          width: 80,
          render: (required: boolean) => (required ? "כן" : "לא"),
        },
        {
          title: "רוחב",
          dataIndex: ["tableOptions", "width"],
          key: "width",
          width: 80,
        },
        {
          title: "מיון",
          dataIndex: ["tableOptions", "sortable"],
          key: "sortable",
          width: 80,
          render: (sortable: boolean) => (sortable ? "כן" : "לא"),
        },
        {
          title: "סינון",
          dataIndex: ["tableOptions", "filterable"],
          key: "filterable",
          width: 80,
          render: (filterable: boolean) => (filterable ? "כן" : "לא"),
        },
        {
          title: "מוסתר",
          dataIndex: "hidden",
          key: "hidden",
        },
        {
          title: "ניתן להוספה",
          dataIndex: "addable",
          key: "addable",
          width: 80,
          render: (_: any, record: any) =>
            record.addable === false ? "לא" : "כן",
        },
        {
          title: "פעולות",
          key: "actions",
          render: (text: any, columnRecord: any) => (
            <Space>
              <Button
                type="text"
                icon={<Edit className="w-4 h-4" />}
                onClick={() => openColumnDrawer(record.id, columnRecord.name)}
              />
              <Popconfirm
                title={`האם אתה בטוח שברצונך למחוק את העמודה ${columnRecord.name}?`}
                onConfirm={() => deleteColumn(record.id, columnRecord.name)}
              >
                <Button
                  type="text"
                  danger
                  icon={<Trash2 className="w-4 h-4" />}
                />
              </Popconfirm>
            </Space>
          ),
        },
      ];

      return (
        <DragDropContext
          onDragEnd={async (result) => {
            if (!result.destination) return;

            const items = Array.from(columnsData);
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination.index, 0, reorderedItem);

            // עדכון הסדר בסכמה
            const updatedSchema = JSON.parse(JSON.stringify(record));
            const newProperties = {};
            const newOrder = items.map((item) => item.name);

            // שמירת הסדר החדש של העמודות
            newOrder.forEach((key) => {
              newProperties[key] = record.schema.properties[key];
            });

            // הוספת עמודות שלא נמצאות ב-ui:order
            Object.keys(record.schema.properties).forEach((key) => {
              if (!newOrder.includes(key)) {
                newProperties[key] = record.schema.properties[key];
              }
            });

            updatedSchema.schema.properties = newProperties;

            // עדכון ה-ui:order
            if (!updatedSchema.uiSchema) {
              updatedSchema.uiSchema = {};
            }
            updatedSchema.uiSchema["ui:order"] = newOrder;

            try {
              await updateDoc(
                doc(db, "schemas", record.id),
                cleanForFirestore(updatedSchema)
              );
              message.success("סדר העמודות עודכן בהצלחה");
            } catch (error) {
              console.error("Error updating columns order:", error);
              message.error("שגיאה בעדכון סדר העמודות");
            }
          }}
        >
          <div style={{ marginRight: "3rem", marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: "500" }}>
                עמודות של {record.title || record.tableName}
              </h3>
              <Button
                type="primary"
                icon={<Plus style={{ width: "1rem", height: "1rem" }} />}
                onClick={() => openColumnDrawer(record.id)}
              >
                הוסף עמודה
              </Button>
            </div>

            <Droppable droppableId="columns">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="border rounded-lg overflow-hidden"
                >
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="w-8"></th>
                        {nestedColumns.map((col) => (
                          <th
                            key={col.key}
                            className="px-4 py-2 text-right border-b"
                            style={{ width: col.width }}
                          >
                            {col.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {columnsData.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={`column-${item.name}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border-b ${
                                snapshot.isDragging ? "bg-blue-50" : "bg-white"
                              }`}
                            >
                              <td className="w-8 px-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab"
                                >
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                </div>
                              </td>
                              <td className="px-4 py-2">{item.name}</td>
                              <td className="px-4 py-2">{item.title}</td>
                              <td className="px-4 py-2">
                                {item.format
                                  ? `${item.type} (${item.format})`
                                  : item.type}
                              </td>
                              <td className="px-4 py-2">
                                {item.componentType}
                              </td>
                              <td className="px-4 py-2">
                                {item.required ? "כן" : "לא"}
                              </td>
                              <td className="px-4 py-2">
                                {item.tableOptions?.width || "-"}
                              </td>
                              <td className="px-4 py-2">
                                {item.tableOptions?.sortable ? "כן" : "לא"}
                              </td>
                              <td className="px-4 py-2">
                                {item.tableOptions?.filterable ? "כן" : "לא"}
                              </td>
                              <td className="px-4 py-2">
                                {item.hidden ? "כן" : "לא"}
                              </td>
                              <td className="px-4 py-2">
                                {item.addable !== false ? "כן" : "לא"}
                              </td>
                              <td className="px-4 py-2">
                                <Space>
                                  <Button
                                    type="text"
                                    icon={<Edit className="w-4 h-4" />}
                                    onClick={() =>
                                      openColumnDrawer(record.id, item.name)
                                    }
                                  />
                                  <Popconfirm
                                    title={`האם אתה בטוח שברצונך למחוק את העמודה ${item.name}?`}
                                    onConfirm={() =>
                                      deleteColumn(record.id, item.name)
                                    }
                                  >
                                    <Button
                                      type="text"
                                      danger
                                      icon={<Trash2 className="w-4 h-4" />}
                                    />
                                  </Popconfirm>
                                </Space>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      );
    },
    expandIcon: ({ expanded, onExpand, record }) => {
      return expanded ? (
        <Button
          type="text"
          icon={<ChevronUp className="w-4 h-4" />}
          onClick={(e) => onExpand(record, e)}
          className="mr-2"
        />
      ) : (
        <Button
          type="text"
          icon={<ChevronDown className="w-4 h-4" />}
          onClick={(e) => onExpand(record, e)}
          className="mr-2"
        />
      );
    },
  };

  const columns = [
    {
      title: "טבלה",
      dataIndex: "tableName",
      key: "tableName",
    },
    {
      title: "כותרת",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: SchemaConfig) => text || record.tableName,
    },
    {
      title: "שדות",
      key: "fields",
      render: (_: any, record: SchemaConfig) =>
        Object.keys(record.schema.properties || {}).length,
    },
    {
      title: "גרסה",
      dataIndex: "version",
      key: "version",
      render: (text: number) => text || 1,
    },
    {
      title: "עודכן",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text: string) =>
        text ? new Date(text).toLocaleString("he-IL") : "-",
    },
    {
      title: "פעולות",
      key: "actions",
      render: (_: any, record: SchemaConfig) => (
        <Space>
          <Tooltip title="ניהול עמודות">
            <Button
              type="text"
              icon={<Columns className="w-4 h-4" />}
              onClick={() => {
                if (expandedRowKeys.includes(record.id)) {
                  setExpandedRowKeys(
                    expandedRowKeys.filter((key) => key !== record.id)
                  );
                } else {
                  setExpandedRowKeys([...expandedRowKeys, record.id]);
                }
              }}
            />
          </Tooltip>
          <Button
            type="text"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="האם אתה בטוח שברצונך למחוק?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<Trash2 className="w-4 h-4" />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="schema-manager">
      <div className="schema-manager-container">
        <Card>
          <div className="schema-manager-header">
            <div className="schema-manager-title">
              <Settings2 className="schema-manager-icon" />
              <h1 className="schema-manager-heading">ניהול סכמות</h1>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<Plus className="button-icon" />}
                onClick={handleAdd}
              >
                הוסף סכמה
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={schemas}
            rowKey="id"
            loading={loading}
            pagination={false}
            expandable={expandableConfig}
          />
        </Card>
      </div>

      <Modal
        title={isEditing ? "עריכת סכמה" : "הוספת סכמה"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            ביטול
          </Button>,
          <Button key="preview" type="default" onClick={updateFormPreview}>
            תצוגה מקדימה
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<Save size={16} />}
            onClick={handleSave}
          >
            שמור
          </Button>,
        ]}
        width={1000}
      >
        <SchemaForm
          form={form}
          isEditing={isEditing}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          rawSchema={rawSchema}
          setRawSchema={setRawSchema}
          rawUiSchema={rawUiSchema}
          setRawUiSchema={setRawUiSchema}
          setFormPreviewData={setFormPreviewData}
          formPreviewData={formPreviewData}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          onPreview={updateFormPreview}
        />
      </Modal>

      <Drawer
        title={editingColumn ? "עריכת עמודה" : "הוספת עמודה חדשה"}
        open={isColumnDrawerOpen}
        onCancel={() => setIsColumnDrawerOpen(false)}
        width={400}
        extra={
          <Space>
            <Button onClick={() => setIsColumnDrawerOpen(false)}>ביטול</Button>
            <Button type="primary" onClick={saveColumn}>
              שמור
            </Button>
          </Space>
        }
      >
        <ColumnForm
          form={columnForm}
          showDropdownOptions={showDropdownOptions}
          schemas={schemas}
          onComponentTypeChange={handleComponentTypeChange}
        />
      </Drawer>
    </div>
  );
}
