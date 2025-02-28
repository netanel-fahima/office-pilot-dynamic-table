import React from "react";
import { Space, Button, Input, Dropdown } from "antd";
import {
  Settings2,
  Search,
  Plus,
  Download,
  FileSpreadsheet,
} from "lucide-react";

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
    formats?: ("csv" | "excel")[];
  };
  onExport?: (format: "csv" | "excel") => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  title,
  onColumnSettingsClick,
  searchText,
  addButtonText = "הוסף רשומה",
  onSearchChange,
  onAdd,
  search = { enabled: true, placeholder: "חיפוש..." },
  columnSettings = { enabled: true, buttonText: "הגדרת עמודות" },
  export: exportOptions = {
    enabled: true,
    buttonText: "ייצוא",
    formats: ["excel", "csv"],
  },
  onExport,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", fontWeight: "600" }}>{title}</h1>
      <Space>
        {exportOptions.enabled && onExport && (
          <Dropdown
            menu={{
              items: [
                ...(exportOptions.formats?.includes("excel")
                  ? [
                      {
                        key: "excel",
                        label: "ייצוא ל-Excel",
                        icon: (
                          <FileSpreadsheet
                            style={{ width: "1rem", height: "1rem" }}
                          />
                        ),
                        onClick: () => onExport("excel"),
                      },
                    ]
                  : []),
                ...(exportOptions.formats?.includes("csv")
                  ? [
                      {
                        key: "csv",
                        label: "ייצוא ל-CSV",
                        icon: (
                          <Download style={{ width: "1rem", height: "1rem" }} />
                        ),
                        onClick: () => onExport("csv"),
                      },
                    ]
                  : []),
              ],
            }}
          >
            <Button
              icon={<Download style={{ width: "1rem", height: "1rem" }} />}
            >
              {exportOptions.buttonText}
            </Button>
          </Dropdown>
        )}
        {columnSettings.enabled && onColumnSettingsClick && (
          <Button
            icon={<Settings2 style={{ width: "1rem", height: "1rem" }} />}
            onClick={onColumnSettingsClick}
          >
            {columnSettings.buttonText}
          </Button>
        )}
        {search.enabled && (
          <Input
            placeholder={search.placeholder}
            prefix={<Search style={{ width: "1rem", height: "1rem" }} />}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: "16rem" }}
          />
        )}
        {onAdd && (
          <Button
            type="primary"
            icon={<Plus style={{ width: "1rem", height: "1rem" }} />}
            onClick={onAdd}
          >
            {addButtonText}
          </Button>
        )}
      </Space>
    </div>
  );
};
