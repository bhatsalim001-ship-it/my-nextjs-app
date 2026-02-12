'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Building2, Briefcase, MapPin, LayoutGrid, Settings, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user, userRole, signOut, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeDepartments: 0,
    activeDesignations: 0,
    activeLocations: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
    toast.success('Logged out successfully')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SecureForce</h1>
              <p className="text-gray-600">Admin Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/employees">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-900 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/departments">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Departments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeDepartments}</p>
                  </div>
                  <Building2 className="w-12 h-12 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/designations">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Designations</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeDesignations}</p>
                  </div>
                  <Briefcase className="w-12 h-12 text-orange-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/locations">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Locations</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeLocations}</p>
                  </div>
                  <MapPin className="w-12 h-12 text-red-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Admin Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Navigate to different admin sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/admin/employees">
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                  <Users className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Employees</p>
                    <p className="text-xs text-gray-600">Manage employee records</p>
                  </div>
                </Button>
              </Link>

              <Link href="/admin/departments">
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                  <Building2 className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Departments</p>
                    <p className="text-xs text-gray-600">Manage departments</p>
                  </div>
                </Button>
              </Link>

              <Link href="/admin/designations">
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                  <Briefcase className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Designations</p>
                    <p className="text-xs text-gray-600">Manage job designations</p>
                  </div>
                </Button>
              </Link>

              <Link href="/admin/locations">
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                  <MapPin className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Locations</p>
                    <p className="text-xs text-gray-600">Manage office locations</p>
                  </div>
                </Button>
              </Link>

              <Link href="/admin/id-cards">
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                  <LayoutGrid className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">ID Cards</p>
                    <p className="text-xs text-gray-600">Generate ID cards</p>
                  </div>
                </Button>
              </Link>

              <Link href="/admin/settings">
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                  <Settings className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Settings</p>
                    <p className="text-xs text-gray-600">Configure company settings</p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-blue-900 text-sm">
              <strong>Welcome to SecureForce Admin Panel!</strong> You're logged in as <strong>{user.email}</strong> with role <strong className="capitalize">{userRole}</strong>.
              Navigate using the menu above to manage employees, designations, departments, and more.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
