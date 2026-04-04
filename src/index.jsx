import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/** Surfaces React render errors instead of a blank page. */
class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      const msg = this.state.error?.message || String(this.state.error);
      return (
        <div style={{ padding: 'clamp(20px, 4vw, 40px)', fontFamily: 'system-ui, sans-serif', maxWidth: '36rem', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.125rem', marginBottom: '12px', color: '#0f172a' }}>Northing can’t display this page</h1>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.55, marginBottom: '14px' }}>
            Something crashed while rendering. Open the browser devtools console (F12 or Cmd+Option+I) for the full stack trace.
          </p>
          <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', background: '#f1f5f9', padding: '14px', borderRadius: '10px', overflow: 'auto', color: '#334155', border: '1px solid #e2e8f0' }}>{msg}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
