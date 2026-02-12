'use client'

import React, { ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    console.error('Error caught by boundary:', error)
    console.error('Error info:', errorInfo)

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry or similar
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md shadow-lg">
            <div className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>

              <h1 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong</h1>

              <p className="mb-4 text-sm text-gray-600">
                An unexpected error has occurred. Please try refreshing the page or contacting support if the problem persists.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 rounded-lg bg-gray-100 p-3 text-left">
                  <p className="mb-1 font-mono text-xs font-semibold text-gray-700">Error details:</p>
                  <p className="font-mono text-xs text-gray-600">{this.state.error?.message}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
                <Button variant="default" onClick={() => window.location.href = '/admin/dashboard'} className="flex-1">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
