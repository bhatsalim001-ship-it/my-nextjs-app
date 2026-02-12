'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft, Printer, Download, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Employee } from '@/lib/validators'
import { CARD_TEMPLATES, CardTemplate } from '@/lib/card-templates'
import { IdCard } from '@/components/id-card-renderer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function IDCardsPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const [employees, setEmployees] = useState<(Employee & { department?: any; designation?: any; location?: any })[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<(Employee & { department?: any; designation?: any; location?: any })[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>(CARD_TEMPLATES[0])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'terminated'>('active')
  const [previewEmployee, setPreviewEmployee] = useState<(Employee & { department?: any; designation?: any; location?: any }) | null>(null)
  const [companySettings, setCompanySettings] = useState<any>(null)

  // Load employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('*, department:department_id(...), designation:designation_id(...), location:location_id(...)')
          .order('name')

        if (empError) throw empError
        setEmployees(empData || [])

        // Fetch company settings
        const { data: settingsData } = await supabase
          .from('company_settings')
          .select('*')
          .limit(1)
          .single()

        setCompanySettings(settingsData)
      } catch (error) {
        toast.error('Failed to load data')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter employees
  useEffect(() => {
    let filtered = employees

    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        e =>
          e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.phone.includes(searchTerm)
      )
    }

    setFilteredEmployees(filtered)
  }, [employees, statusFilter, searchTerm])

  // Check authorization
  useEffect(() => {
    if (!user || !['admin', 'super_admin'].includes(userRole || '')) {
      router.push('/admin/dashboard')
      toast.error('Unauthorized access')
    }
  }, [user, userRole, router])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(filteredEmployees.map(e => e.id))
    } else {
      setSelectedEmployees([])
    }
  }

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId])
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId))
    }
  }

  const handlePrint = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee')
      return
    }

    // Print the selected cards
    window.print()
    toast.success(`Printing ${selectedEmployees.length} ID card(s)...`)
  }

  const handleDownloadPDF = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee')
      return
    }

    toast.success('PDF download feature coming soon!')
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
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ID Cards</h1>
              <p className="text-gray-600">Generate and manage employee ID cards</p>
            </div>
          </div>

          {/* Template Selector */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Template
              </label>
              <Select value={selectedTemplate.id} onValueChange={(value) => {
                const template = CARD_TEMPLATES.find(t => t.id === value)
                if (template) setSelectedTemplate(template)
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARD_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.width}" × {template.height}")
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link href="/admin/id-card-templates">
              <Button variant="outline">
                Browse Templates
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Employee Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Employees</CardTitle>
                <CardDescription>
                  {selectedEmployees.length} selected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="space-y-3">
                  <Input
                    placeholder="Search by name, ID, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee List */}
                <div className="border rounded-lg max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50">
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                            onChange={(checked) => handleSelectAll(checked)}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map(emp => (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedEmployees.includes(emp.id)}
                              onChange={(checked) => handleSelectEmployee(emp.id, checked)}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-sm">{emp.name}</TableCell>
                          <TableCell className="text-sm">{emp.employee_id}</TableCell>
                          <TableCell>
                            <Badge className={emp.status === 'active' ? 'bg-green-100 text-green-800' : ''}>{emp.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handlePrint}
                    disabled={selectedEmployees.length === 0}
                    className="flex-1 gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Cards
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    disabled={selectedEmployees.length === 0}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card Preview */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Preview</CardTitle>
                <CardDescription>
                  {selectedEmployees.length > 0
                    ? `${selectedEmployees.length} card(s) selected`
                    : 'Select employees to preview'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedEmployees.length > 0 ? (
                  <div className="space-y-6 max-h-[600px] overflow-y-auto">
                    {selectedEmployees.slice(0, 3).map(empId => {
                      const emp = employees.find(e => e.id === empId)
                      return emp ? (
                        <div key={emp.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold text-sm">{emp.name}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPreviewEmployee(emp)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="transform scale-50 origin-top-left">
                            <IdCard
                              template={selectedTemplate}
                              employee={emp}
                              companySettings={companySettings}
                            />
                          </div>
                        </div>
                      ) : null
                    })}
                    {selectedEmployees.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{selectedEmployees.length - 3} more card(s)
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Select employees to preview cards</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Use the print function (Ctrl+P or Cmd+P) to save as PDF or print directly to a printer.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Full Screen Preview Dialog */}
      {previewEmployee && (
        <Dialog open={!!previewEmployee} onOpenChange={() => setPreviewEmployee(null)}>
          <DialogContent className="max-w-4xl h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{previewEmployee.name} - ID Card Preview</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-8 bg-gray-50 rounded-lg">
              <IdCard
                template={selectedTemplate}
                employee={previewEmployee}
                companySettings={companySettings}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .hidden {
            display: none !important;
          }
          @page {
            margin: 0.25in;
            size: ${selectedTemplate.width}in ${selectedTemplate.height}in;
          }
        }
      `}</style>
    </div>
  )
}

