import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ContentProvider } from './ContentContext';
import App from './App';
import './style.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><ContentProvider><App/></ContentProvider></BrowserRouter></React.StrictMode>);
