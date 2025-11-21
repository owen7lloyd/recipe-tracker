'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // In production, you would send this to an error tracking service like Sentry
    // logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6 text-center">
            {/* Error Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>

            {/* Error Title */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                We're sorry for the inconvenience. An unexpected error occurred.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {this.props.showDetails && process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-left dark:border-red-800 dark:bg-red-900/10">
                <h3 className="mb-2 font-semibold text-red-900 dark:text-red-300">
                  Error Details (Development):
                </h3>
                <pre className="overflow-auto text-xs text-red-800 dark:text-red-400">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="mt-2 overflow-auto text-xs text-red-700 dark:text-red-500">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={this.handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>

            {/* Support Text */}
            <p className="text-xs text-slate-500 dark:text-slate-600">
              If this problem persists, please refresh the page or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for functional components with hooks
export function ErrorBoundaryWrapper({
  children,
  fallback,
  onReset,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}) {
  return (
    <ErrorBoundary fallback={fallback} onReset={onReset} showDetails>
      {children}
    </ErrorBoundary>
  );
}
