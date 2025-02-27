import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { message } from 'antd';

export const useFirestore = (collectionName: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    const fetchData = () => {
      try {
        const q = query(collection(db, collectionName));
        return onSnapshot(q, {
          next: (snapshot) => {
            const fetchedData = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
            setData(fetchedData);
            setLoading(false);
          },
          error: (error) => {
            console.error(`Error fetching ${collectionName}:`, error);
            message.error('שגיאה בטעינת נתונים');
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error setting up data listener:', error);
        return () => {};
      }
    };

    unsubscribe = fetchData();
    return () => unsubscribe();
  }, [collectionName]);

  return { data, loading };
}