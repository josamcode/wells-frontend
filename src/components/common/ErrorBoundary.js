import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log to console with full details
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg border border-red-200 p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ltr:ml-3 rtl:mr-3">
                <h3 className="text-lg font-medium text-red-800">
                  Something went wrong
                </h3>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-4">
                An error occurred while rendering this component. This is usually caused by:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
                <li>Invalid component import/export</li>
                <li>Undefined component being rendered</li>
                <li>Missing or incorrect props</li>
                <li>Build/compilation error</li>
              </ul>

              {this.state.error && (
                <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
                  <p className="text-sm font-semibold text-red-800 mb-2">
                    Error Message:
                  </p>
                  <pre className="text-xs text-red-700 overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </div>
              )}

              {this.state.errorInfo && this.state.errorInfo.componentStack && (
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    Component Stack:
                  </p>
                  <pre className="text-xs text-gray-700 overflow-auto max-h-40 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Try Again
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>Check the browser console for more details.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

