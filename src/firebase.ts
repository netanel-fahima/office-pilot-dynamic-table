import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const defaultConfig = {
  apiKey: "AIzaSyDBFG7RFSPGdA7bxIKcJxdap6v8lyKaKgE",
  authDomain: "office-pilot.firebaseapp.com",
  projectId: "office-pilot",
  storageBucket: "office-pilot.firebasestorage.app",
  messagingSenderId: "627687272994",
  appId: "1:627687272994:web:740bed9af9da78e523507b",
};

let app: any;
let db: any;

export const initializeFirebase = (config: any = defaultConfig, dbName: string = "office-pilot-dev") => {
  app = initializeApp(config);
  db = getFirestore(app, dbName);
  return { app, db };
};

// אתחול אוטומטי עם הגדרות ברירת המחדל אם לא בוצע אתחול ידני
if (!app || !db) {
  initializeFirebase();
}

export { app, db };