import React from 'react';
import { App as AntApp } from 'antd';
import SchemaManager from './components/SchemaManager';
import ContactsPage from './pages/ContactsPage';

export default function App() {
  return (
    <AntApp>
      <SchemaManager />
      <ContactsPage />
    </AntApp>
  );
}