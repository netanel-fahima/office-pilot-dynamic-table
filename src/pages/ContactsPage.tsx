import React from 'react';
import { MessageSquare, Save } from 'lucide-react';
import DynamicTable from '../components/DynamicTable';

const ContactsPage: React.FC = () => {
  return (
    <DynamicTable
      tableName="contacts"
      title="אנשי קשר"
      pagination={{
        enabled: true,
        pageSize: 15,
        showSizeChanger: true,
      }}
      actions={{
        add: true,
        edit: true,
        delete: true,
        save:true,
        addButtonText: 'הוסף איש קשר',
        icons: {
          save: <Save className="w-4 h-4" />,
        }
      }}
      customActions={[
        {
          key: 'sendMessage',
          label: 'שלח הודעה',
          icon: <MessageSquare className="w-4 h-4" />,
          onClick: (record) => {
            console.log('Sending message to:', record);
            // כאן תוכל להוסיף את הלוגיקה לשליחת הודעה
          },
          confirm: {
            title: 'שליחת הודעה',
            content: 'האם אתה בטוח שברצונך לשלוח הודעה?',
          },
        },
      ]}
    />
  );
};

export default ContactsPage;