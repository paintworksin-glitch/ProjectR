"use client";

import { Component } from "react";

/**
 * Catches render errors in child trees and shows a recovery UI.
 */
export class NorthingErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { crashed: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Northing crash:", error, info);
  }

  render() {
    if (this.state.crashed) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--cream)",
            fontFamily: "'Inter',sans-serif",
            padding: 24,
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 800, color: "var(--navy)", marginBottom: 8 }}>
              Northing
            </div>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 14, color: "#78716c", marginBottom: 24, lineHeight: 1.6 }}>
              The app encountered an unexpected error. Your data is safe — just reload to continue.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: "#1a1a1a",
                color: "#fff",
                border: "none",
                padding: "12px 28px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ↺ Reload App
            </button>
            {this.state.error ? (
              <details
                style={{
                  marginTop: 20,
                  textAlign: "left",
                  fontSize: 11,
                  color: "#aaa",
                  background: "var(--gray)",
                  padding: 12,
                  borderRadius: 8,
                  wordBreak: "break-all",
                }}
              >
                <summary style={{ cursor: "pointer", marginBottom: 6 }}>Error details</summary>
                {this.state.error.toString()}
              </details>
            ) : null}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
