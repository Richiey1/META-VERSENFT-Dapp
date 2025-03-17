import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header/index';

const Layout = () => {
  return (
      <div>
        <Header /> 
        <Outlet />
      </div>
  );
};

export default Layout;