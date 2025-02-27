export const cleanForFirestore = (data: any): any => {
  if (data === undefined) {
    return null;
  }
  
  if (data === null) {
    return null;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => cleanForFirestore(item));
  }
  
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  if (typeof data === 'object') {
    const cleanedObj: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      cleanedObj[key] = cleanForFirestore(value);
    });
    return cleanedObj;
  }
  
  return data;
};

export const processValueForSave = (value: any, propertyKey: string, schema: any): any => {
  const property = schema.properties[propertyKey];
  if (!property) return value;
  
  const componentType = property.tableOptions?.componentType || '';
  
  switch (property.type) {
    case 'string':
      if (value === undefined || value === null) {
        return '';
      } else if (componentType === 'date' || componentType === 'datetime' || componentType === 'time') {
        return value ? value.toISOString() : null;
      } else {
        return String(value);
      }
    case 'number':
    case 'integer':
      if (value === undefined || value === null || value === '') {
        return 0;
      } else {
        return Number(value);
      }
    case 'boolean':
      return Boolean(value);
    case 'array':
      return Array.isArray(value) ? value : [];
    case 'object':
      return value && typeof value === 'object' ? cleanForFirestore(value) : {};
    default:
      return value === undefined ? null : value;
  }
};