"use client";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { createHashRouter, RouterProvider } from "react-router";
import DashboardLayout from "./DashboardLayout";
import ActivityList from "./ActivityList";
import ActivityShow from "./ActivityShow";
import ActivityCreate from "./ActivityCreate";
import ActivityEdit from "./ActivityEdit";
import NotificationsProvider from "../hooks/useNotifications/NotificationsProvider";
import DialogsProvider from "../hooks/useDialogs/DialogsProvider";
import AppTheme from "../../shared-theme/AppTheme";
import {
    dataGridCustomizations,
    datePickersCustomizations,
    sidebarCustomizations,
    formInputCustomizations,
} from "../theme/customizations";

const router = createHashRouter([
    {
        Component: DashboardLayout,
        children: [
            { path: "/activities", Component: ActivityList },
            { path: "/activities/:activityId", Component: ActivityShow },
            { path: "/activities/new", Component: ActivityCreate },
            { path: "/activities/:activityId/edit", Component: ActivityEdit },
            { path: "*", Component: ActivityList },
        ],
    },
]);

const themeComponents = {
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...sidebarCustomizations,
    ...formInputCustomizations,
};

export default function CrudDashboardClient(props) {
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
