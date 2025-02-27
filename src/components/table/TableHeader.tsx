import React from 'react';
import { Space, Button, Input, Dropdown } from 'antd';
import { Settings2, Search, Plus, Download, FileSpreadsheet } from 'lucide-react';

interface TableHeaderProps {
  title: string;
  onColumnSettingsClick?: () => void;
  searchText: string;
  addButtonText?: string;
  onSearchChange: (value: string) => void;
  onAdd?: () => void;
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
  onExport?: (format: 'csv' | 'excel') => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  title,
  onColumnSettingsClick,
  searchText,
  addButtonText = 'הוסף רשומה',
  onSearchChange,
  onAdd,
  search = { enabled: true, placeholder: 'חיפוש...' },
  columnSettings = { enabled: true, buttonText: 'הגדרת עמודות' },
  export: exportOptions = { enabled: true, buttonText: 'ייצוא', formats: ['excel', 'csv'] },
  onExport,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <Space>
        {exportOptions.enabled && onExport && (
          <Dropdown
            menu={{
              items: [
                ...(exportOptions.formats?.includes('excel') ? [{
                  key: 'excel',
                  label: 'ייצוא ל-Excel',
                  icon: <FileSpreadsheet className="w-4 h-4" />,
                  onClick: () => onExport('excel'),
                }] : []),
                ...(exportOptions.formats?.includes('csv') ? [{
                  key: 'csv',
                  label: 'ייצוא ל-CSV',
                  icon: <Download className="w-4 h-4" />,
                  onClick: () => onExport('csv'),
                }] : []),
              ],
            }}
          >
            <Button icon={<Download className="w-4 h-4" />}>
              {exportOptions.buttonText}
            </Button>
          </Dropdown>
        )}
        {columnSettings.enabled && onColumnSettingsClick && (
          <Button
            icon={<Settings2 className="w-4 h-4" />}
            onClick={onColumnSettingsClick}
          >
            {columnSettings.buttonText}
          </Button>
        )}
        {search.enabled && (
          <Input
            placeholder={search.placeholder}
            prefix={<Search className="w-4 h-4" />}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64"
          />
        )}
        {onAdd && (
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={onAdd}
          >
            {addButtonText}
          </Button>
        )}
      </Space>
    </div>
  );
};