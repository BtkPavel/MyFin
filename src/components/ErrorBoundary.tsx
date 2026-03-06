"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFAF9]">
          <div className="text-center max-w-sm">
            <p className="text-4xl mb-4">⚠️</p>
            <h1 className="text-lg font-semibold text-[#1C1917] mb-2">
              Что-то пошло не так
            </h1>
            <p className="text-sm text-[#78716C] mb-6">
              Обновите страницу или попробуйте позже
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#0F766E] text-white rounded-xl font-medium"
            >
              Обновить
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
