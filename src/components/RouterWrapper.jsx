import React from 'react';
import { BrowserRouter } from 'react-router-dom';

export function RouterWrapper({ children }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}