"use client";
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createHashRouter, RouterProvider } from 'react-router';
import DashboardLayout from './components/DashboardLayout';
import ActivityList from './components/ActivityList';
import ActivityShow from './components/ActivityShow';
import ActivityCreate from './components/ActivityCreate';
import ActivityEdit from './components/ActivityEdit';
import NotificationsProvider from './hooks/useNotifications/NotificationsProvider';
import DialogsProvider from './hooks/useDialogs/DialogsProvider';
import AppTheme from '../shared-theme/AppTheme';
import {
  dataGridCustomizations,
  datePickersCustomizations,
  sidebarCustomizations,
  formInputCustomizations,
} from './theme/customizations';

const router = createHashRouter([
  {
    Component: DashboardLayout,
    children: [
      {
        path: '/activities',
        Component: ActivityList,
      },
      {
        path: '/activities/:activityId',
        Component: ActivityShow,
      },
      {
        path: '/activities/new',
        Component: ActivityCreate,
      },
      {
        path: '/activities/:activityId/edit',
        Component: ActivityEdit,
      },
      // Fallback route for the example routes in dashboard sidebar items
      {
        path: '*',
        Component: ActivityList,
      },
    ],
  },
]);

const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

export default function CrudDashboard(props) {
  return (
    <AppTheme {...props} themeComponents={themeComponents}>
      <CssBaseline enableColorScheme />
      <NotificationsProvider>
        <DialogsProvider>
          <RouterProvider router={router} />
        </DialogsProvider>
      </NotificationsProvider>
    </AppTheme>
  );
}
