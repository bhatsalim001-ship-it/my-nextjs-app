'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || !['admin', 'super_admin'].includes(userRole || '')) {
      router.push('/admin/dashboard')
    }
  }, [user, userRole, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Configure company settings and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Management</h3>
            <p className="text-gray-600 mb-6">This feature is under development</p>
            <p className="text-sm text-gray-500">
              Soon you'll be able to configure company name, address, logo, and other branding settings.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
