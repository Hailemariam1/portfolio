import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ui] rendering error', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="container-page flex min-h-[50vh] flex-col items-start justify-center py-16">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-3 font-display text-3xl">This page could not be displayed.</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
          Refresh the page to try again. If the problem continues, please come back later.
        </p>
        <button type="button" className="btn-primary mt-6" onClick={() => window.location.reload()}>
          Refresh page
        </button>
      </main>
    );
  }
}
