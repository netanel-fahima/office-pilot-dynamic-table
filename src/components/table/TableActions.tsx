import React from 'react';
import { Button, Space, Popconfirm } from 'antd';
import { Save, Edit, Trash2 } from 'lucide-react';

interface TableActionsProps {
  record: any;
  editable: boolean;
  editingKey: string;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TableActions: React.FC<TableActionsProps> = ({
  record,
  editable,
  editingKey,
  onSave,
  onCancel,
  onEdit,
  onDelete,
}) => {
  return editable ? (
    <Space.Compact>
      <Button
        type="text"
        icon={<Save className="w-4 h-4" />}
        onClick={onSave}
      />
      <Button
        type="text"
        onClick={onCancel}
      >
        ביטול
      </Button>
    </Space.Compact>
  ) : (
    <Space.Compact>
      <Button
        type="text"
        icon={<Edit className="w-4 h-4" />}
        disabled={editingKey !== ''}
        onClick={onEdit}
      />
      <Popconfirm
        title="האם אתה בטוח שברצונך למחוק?"
        onConfirm={onDelete}
      >
        <Button
          disabled={editingKey !== ''}
          type="text"
          danger
          icon={<Trash2 className="w-4 h-4" />}
        />
      </Popconfirm>
    </Space.Compact>
  );
};