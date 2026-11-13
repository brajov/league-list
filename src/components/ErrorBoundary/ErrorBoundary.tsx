import { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean };

// Catches an error thrown while rendering, which would otherwise leave a blank
// page, and offers a reload instead. Request failures do not come through
// here: they have their own error states with Retry.
//
// A class because React only supports error boundaries as class components.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('The app failed to render', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <div className={styles.box} role="alert">
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.message}>The page hit an unexpected error.</p>
        <button type="button" className={styles.action} onClick={() => window.location.reload()}>
          Reload the page
        </button>
      </div>
    );
  }
}
