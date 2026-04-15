import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-4">
          <p className="font-display text-2xl text-miss font-bold tracking-wide">Something went wrong.</p>
          <p className="font-body text-sm text-muted text-center">
            Reload the page to try again. If the problem persists, your saved data may be corrupted.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-accent text-white font-display text-sm tracking-widest rounded-lg hover:bg-accent/90 transition-colors"
          >
            RELOAD
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
