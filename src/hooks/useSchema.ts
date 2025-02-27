import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { message } from 'antd';
import type { SchemaConfig } from '../types/schema';

export const useSchema = (tableName: string) => {
  const [schema, setSchema] = useState<SchemaConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchema = () => {
      try {
        const q = query(collection(db, 'schemas'), where('tableName', '==', tableName));
        return onSnapshot(q, {
          next: (snapshot) => {
            const schemaData = snapshot.docs[0]?.data() as SchemaConfig;
            if (schemaData) {
              schemaData.id = snapshot.docs[0].id;
              setSchema(schemaData);
            }
            setLoading(false);
          },
          error: (error) => {
            console.error('Error fetching schema:', error);
            message.error('שגיאה בטעינת הגדרות הטבלה');
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error setting up schema listener:', error);
        return () => {};
      }
    };

    const unsubscribe = fetchSchema();
    return () => unsubscribe();
  }, [tableName]);

  return { schema, loading };
};