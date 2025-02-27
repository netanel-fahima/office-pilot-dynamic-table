import React from 'react';
import { Modal, Checkbox, Button } from 'antd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import type { SchemaConfig } from '../../types/schema';

interface ColumnSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  schema: SchemaConfig;
  visibleColumns: string[];
  onVisibleColumnsChange: (columns: string[]) => void;
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  isOpen,
  onClose,
  schema,
  visibleColumns,
  onVisibleColumnsChange,
}) => {  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(visibleColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onVisibleColumnsChange(items);
  };

  return (
    <Modal
      title="בחירת עמודות"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          סגור
        </Button>
      ]}
      width={400}
    >
      <div className="mb-4 text-gray-500 text-sm">
        גרור את העמודות כדי לשנות את הסדר שלהן
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          <div>
            <div className="font-medium mb-2">עמודות מוצגות</div>
            <Droppable droppableId="visible-columns">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {visibleColumns.map((key, index) => {
                    const prop = schema.schema.properties[key];
                    if (!prop) return null;
                    return (
                      <Draggable key={`column-${key}`} draggableId={`column-${key}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center justify-between bg-white p-3 rounded border ${
                              snapshot.isDragging ? 'shadow-lg border-blue-400' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps} className="cursor-grab">
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </div>
                              <span>{prop.title || key}</span>
                            </div>
                            <Checkbox
                              checked={true}
                              onChange={(e) => {
                                if (!e.target.checked) {
                                  onVisibleColumnsChange(
                                    visibleColumns.filter(field => field !== key)
                                  );
                                }
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          <div>
            <div className="font-medium mb-2">עמודות מוסתרות</div>
            <div className="space-y-2">
              {Object.entries(schema.schema.properties)
                .filter(([key]) => !visibleColumns.includes(key))
                .map(([key, prop]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded border"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-300" />
                      <span className="text-gray-500">{prop.title || key}</span>
                    </div>
                    <Checkbox
                      checked={false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onVisibleColumnsChange([...visibleColumns, key]);
                        }
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </DragDropContext>
    </Modal>
  );
};