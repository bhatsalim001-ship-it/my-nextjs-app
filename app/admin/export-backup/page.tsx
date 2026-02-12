'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { ArrowLeft, Download, Upload, FileJson, FileSpreadsheet, Archive, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface BackupFile {
  id: string
  filename: string
  size: number
  created_at: string
}

export default function ExportBackupPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [designations, setDesignations] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [companySettings, setCompanySettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [backing, setBacking] = useState(false)
  const [backups, setBackups] = useState<BackupFile[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('csv')

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, deptRes, desigRes, locRes, settingsRes] = await Promise.all([
          supabase.from('employees').select('*'),
          supabase.from('departments').select('*'),
          supabase.from('designations').select('*'),
          supabase.from('locations').select('*'),
          supabase.from('company_settings').select('*').limit(1).single(),
        ])

        if (empRes.error) throw empRes.error
        setEmployees(empRes.data || [])
        setDepartments(deptRes.data || [])
        setDesignations(desigRes.data || [])
        setLocations(locRes.data || [])
        setCompanySettings(settingsRes.data || null)
      } catch (error) {
        toast.error('Failed to load data')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Check authorization
  useEffect(() => {
    if (!user || !['admin', 'super_admin'].includes(userRole || '')) {
      router.push('/admin/dashboard')
      toast.error('Unauthorized access')
    }
  }, [user, userRole, router])

  // Export functions
  const exportAsCSV = () => {
    setExporting(true)
    try {
      const headers = ['Employee ID', 'Name', 'Email', 'Phone', 'Department', 'Designation', 'Location', 'Status', 'ID Valid Until']
      const rows = employees.map(emp => {
        const dept = departments.find(d => d.id === emp.department_id)
        const desig = designations.find(d => d.id === emp.designation_id)
        const loc = locations.find(l => l.id === emp.location_id)
        return [
          emp.employee_id,
          emp.name,
          emp.email || '',
          emp.phone || '',
          dept?.name || '',
          desig?.name || '',
          loc?.name || '',
          emp.status,
          emp.id_card_valid_until || '',
        ]
      })

      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
      downloadFile(csv, `employees-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
      toast.success(`Exported ${employees.length} employees as CSV`)
    } catch (error) {
      toast.error('Failed to export CSV')
      console.error(error)
    } finally {
      setExporting(false)
    }
  }

  const exportAsJSON = () => {
    setExporting(true)
    try {
      const data = {
        export_date: new Date().toISOString(),
        company: companySettings,
        summary: {
          total_employees: employees.length,
          total_departments: departments.length,
          total_designations: designations.length,
          total_locations: locations.length,
        },
        employees: employees.map(emp => ({
          ...emp,
          department: departments.find(d => d.id === emp.department_id),
          designation: designations.find(d => d.id === emp.designation_id),
          location: locations.find(l => l.id === emp.location_id),
        })),
        departments,
        designations,
        locations,
      }

      const json = JSON.stringify(data, null, 2)
      downloadFile(json, `backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json')
      toast.success('Exported as JSON backup')
    } catch (error) {
      toast.error('Failed to export JSON')
      console.error(error)
    } finally {
      setExporting(false)
    }
  }

  const createBackup = async () => {
    setBacking(true)
    try {
      const backupData = {
        export_date: new Date().toISOString(),
        version: '1.0',
        company: companySettings,
        summary: {
          total_employees: employees.length,
          total_departments: departments.length,
          total_designations: designations.length,
          total_locations: locations.length,
        },
        employees,
        departments,
        designations,
        locations,
      }

      const backupJSON = JSON.stringify(backupData)
      const filename = `secureforce-backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('backups')
        .upload(`database-backups/${filename}`, new Blob([backupJSON], { type: 'application/json' }), {
          upsert: false,
        })

      if (uploadError) throw uploadError

      toast.success('Backup created successfully')

      // Refresh backups list
      fetchBackups()
    } catch (error) {
      toast.error('Failed to create backup')
      console.error(error)
    } finally {
      setBacking(false)
    }
  }

  const fetchBackups = async () => {
    try {
      const { data, error } = await supabase.storage.from('backups').list('database-backups')
      if (error) throw error

      const backupList = (data || []).map(file => ({
        id: file.name,
        filename: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at || new Date().toISOString(),
      }))

      setBackups(backupList)
    } catch (error) {
      console.error('Failed to fetch backups:', error)
    }
  }

  const deleteBackup = async (filename: string) => {
    try {
      const { error } = await supabase.storage
        .from('backups')
        .remove([`database-backups/${filename}`])

      if (error) throw error

      setBackups(backups.filter(b => b.filename !== filename))
      toast.success('Backup deleted successfully')
    } catch (error) {
      toast.error('Failed to delete backup')
      console.error(error)
    } finally {
      setDeleteConfirm(null)
    }
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = Window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    Window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <h1 className="text-3xl font-bold text-gray-900">Export & Backup</h1>
              <p className="text-gray-600">Export data and manage backups</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download employee data in various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                    <SelectItem value="json">JSON (Complete Data)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Records to export:</strong> {employees.length} employees
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={exportAsCSV}
                  disabled={exporting || employees.length === 0}
                  className="w-full gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {exporting ? 'Exporting...' : 'Export as CSV'}
                </Button>
                <Button
                  onClick={exportAsJSON}
                  disabled={exporting || employees.length === 0}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <FileJson className="w-4 h-4" />
                  {exporting ? 'Exporting...' : 'Export as JSON'}
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ CSV format is compatible with Excel and Google Sheets</p>
                <p>✓ JSON includes complete database structure</p>
                <p>✓ Files include metadata and timestamps</p>
              </div>
            </CardContent>
          </Card>

          {/* Backup Section */}
          <Card>
            <CardHeader>
              <CardTitle>Database Backup</CardTitle>
              <CardDescription>Create and manage database backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900">
                  <strong>Backup Status:</strong> Ready to create backup
                </p>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Employees:</strong> {employees.length}
                </p>
                <p>
                  <strong>Departments:</strong> {departments.length}
                </p>
                <p>
                  <strong>Designations:</strong> {designations.length}
                </p>
                <p>
                  <strong>Locations:</strong> {locations.length}
                </p>
              </div>

              <Button
                onClick={() => {
                  createBackup()
                  setTimeout(fetchBackups, 1000)
                }}
                disabled={backing}
                className="w-full gap-2"
              >
                <Archive className="w-4 h-4" />
                {backing ? 'Creating Backup...' : 'Create Backup Now'}
              </Button>

              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ Backup includes all data</p>
                <p>✓ Stored securely in cloud</p>
                <p>✓ Timestamped and versioned</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backups List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Backup History</CardTitle>
            <CardDescription>Manage existing backups</CardDescription>
          </CardHeader>
          <CardContent>
            {backups.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No backups created yet</p>
                <p className="text-sm text-gray-400 mt-2">Create a backup to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map(backup => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-mono text-sm">{backup.filename}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(backup.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {(backup.size / 1024).toFixed(2)} KB
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.info('Restore feature coming soon')}
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(backup.filename)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-900">
              <strong>⚠️ Backup Retention:</strong> Backups are retained for 90 days. We recommend creating
              regular backups for disaster recovery and compliance purposes.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Backup</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this backup? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteConfirm && deleteBackup(deleteConfirm)}
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
