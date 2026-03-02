import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-4">Please refresh the page or try again later.</p>
            <button onClick={() => window.location.reload()} className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600">Refresh</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
