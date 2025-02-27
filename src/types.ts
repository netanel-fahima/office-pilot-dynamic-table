export interface ColumnConfig {
  id: string;
  tableName: string;
  align?: 'left' | 'right' | 'center';
  fixed?: boolean | 'left' | 'right';
  label: string;
  exportLabel: string;
  readOnly: boolean;
  componentType: {
    name: string;
    order: number;
  };
  title: string;
  gridField: string;
  width?: string | number;
  minWidth?: number;
  ellipsis?: boolean;
  defaultSortOrder?: 'ascend' | 'descend';
  sortDirections?: ('ascend' | 'descend')[];
  gridVisible: boolean;
  gridInitialHide: boolean;
  gridSortable: boolean;
  gridFilterable: boolean;
  gridExportable: boolean;
  gridEditable: boolean;
  gridAutosize: boolean;
  hidden?: boolean;
  dropdownOptions?: {
    type: 'static' | 'dynamic';
    values?: { label: string; value: string | number }[];
    sourceTable?: string;
    labelField?: string;
    valueField?: string;
  };
}