
import React, { useEffect } from 'react';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';

const AdminDashboard = () => {
    useEffect(() => {
        console.log("Admin Dashboard MOUNTED");
    }, []);

    return (
        <div className="p-12 text-center">
            <h1 className="text-2xl font-bold text-green-600">✅ Admin Dashboard Loaded</h1>
            <p className="text-slate-500">If you see this, the crash is fixed. We will now restore features one by one.</p>
        </div>
    );
};

export default function SafeAdminDashboard() {
    return (
        <DashboardErrorBoundary>
            <AdminDashboard />
        </DashboardErrorBoundary>
    );
};
