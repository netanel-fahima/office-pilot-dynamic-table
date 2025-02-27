# @office-pilot/dynamic-table

ספריית React לניהול טבלאות דינמיות עם תמיכה ב-Firestore.

## התקנה

```bash
npm install @office-pilot/dynamic-table
```

## דרישות מקדימות

הספרייה דורשת את החבילות הבאות כ-peer dependencies:

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "antd": "^5.0.0",
  "firebase": "^10.0.0",
  "@hello-pangea/dnd": "^16.0.0",
  "@rjsf/antd": "^5.0.0",
  "@rjsf/core": "^5.0.0",
  "@rjsf/utils": "^5.0.0",
  "@rjsf/validator-ajv8": "^5.0.0",
  "xlsx": "^0.18.0",
  "file-saver": "^2.0.0"
}
```

## אתחול Firebase

ניתן להשתמש בספרייה עם הגדרות ברירת המחדל או להגדיר את Firebase באופן מותאם אישית:

```tsx
import { initializeFirebase } from '@office-pilot/dynamic-table';

// שימוש בהגדרות ברירת המחדל
// הספרייה תתאתחל אוטומטית עם הגדרות ברירת המחדל

// או - הגדרה מותאמת אישית
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// אתחול Firebase עם הגדרות מותאמות אישית
initializeFirebase(firebaseConfig);
```

## שימוש בסיסי

```tsx
import { DynamicTable } from '@office-pilot/dynamic-table';

function App() {
  return (
    <DynamicTable
      tableName="contacts"
      title="אנשי קשר"
      pagination={{
        enabled: true,
        pageSize: 10
      }}
    />
  );
}
```

## תכונות

- טבלה דינמית עם תמיכה בעריכה
- ניהול סכמות נתונים
- טפסים דינמיים
- ייצוא לאקסל ו-CSV
- גרירה ושחרור לסידור עמודות
- חיפוש וסינון
- תמיכה מלאה ב-TypeScript

## רכיבים עיקריים

### DynamicTable

טבלה דינמית עם יכולות עריכה, סינון וייצוא.

```tsx
<DynamicTable
  tableName="users"
  title="משתמשים"
  pagination={{
    enabled: true,
    pageSize: 15
  }}
  search={{
    enabled: true,
    placeholder: "חיפוש..."
  }}
  export={{
    enabled: true,
    formats: ['excel', 'csv']
  }}
/>
```

### SchemaManager

מנהל הסכמות מאפשר יצירה ועריכה של מבני טבלאות.

```tsx
<SchemaManager />
```

### DynamicJsonForm

טופס דינמי המבוסס על סכמה.

```tsx
<DynamicJsonForm
  schemaConfig={schemaConfig}
  onSubmit={handleSubmit}
/>
```

## רישיון

MIT