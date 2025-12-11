
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('AdminDashboard Crash:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Dashboard Error</h2>
                    <p className="text-slate-500 mb-4">Something went wrong rendering the charts.</p>
                    <pre className="text-left bg-red-50 text-red-700 p-4 rounded text-xs overflow-auto max-w-lg mx-auto">
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-700"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
