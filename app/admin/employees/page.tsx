'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, AlertCircle, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Employee, Department, Designation, Location } from '@/lib/validators'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { employeeFormSchema, type EmployeeFormInput } from '@/lib/validators'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { generateEmployeeId, uploadEmployeePhoto, deleteEmployeePhoto } from '@/lib/helpers'

export default function EmployeesPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const [employees, setEmployees] = useState<(Employee & { department?: any; designation?: any; location?: any })[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [generatedEmployeeId, setGeneratedEmployeeId] = useState<string>('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const form = useForm<EmployeeFormInput>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      departmentId: '',
      designationId: '',
      locationId: '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      emergencyContactName: '',
      emergencyContactPhone: '',
      status: 'active',
      idCardValidFrom: new Date().toISOString().split('T')[0],
      idCardValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
        .toISOString()
        .split('T')[0],
    },
  })

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all required data
        const [deptsRes, desigRes, locsRes, empRes] = await Promise.all([
          supabase.from('departments').select('*'),
          supabase.from('designations').select('*, department:department_id(...)'),
          supabase.from('locations').select('*'),
          supabase.from('employees').select('*, department:department_id(...), designation:designation_id(...), location:location_id(...)')
            .order('created_at', { ascending: false }),
        ])

        if (deptsRes.error) throw deptsRes.error
        if (desigRes.error) throw desigRes.error
        if (locsRes.error) throw locsRes.error
        if (empRes.error) throw empRes.error

        setDepartments(deptsRes.data || [])
        setDesignations(desigRes.data || [])
        setLocations(locsRes.data || [])
        setEmployees(empRes.data || [])
      } catch (error) {
        toast.error('Failed to load data')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Generate employee ID when opening dialog
  useEffect(() => {
    if (isDialogOpen && !editingId) {
      generateEmployeeId()
        .then(id => setGeneratedEmployeeId(id))
        .catch(err => {
          toast.error('Failed to generate employee ID')
          console.error(err)
        })
    }
  }, [isDialogOpen, editingId])

  // Check authorization
  useEffect(() => {
    if (!user || !['admin', 'super_admin'].includes(userRole || '')) {
      router.push('/admin/dashboard')
      toast.error('Unauthorized access')
    }
  }, [user, userRole, router])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (values: EmployeeFormInput) => {
    try {
      let photoUrl: string | null = null

      // Upload photo if selected
      if (selectedFile && !editingId) {
        setUploadingPhoto(true)
        try {
          const tempEmployeeId = generatedEmployeeId || 'temp'
          photoUrl = await uploadEmployeePhoto(selectedFile, tempEmployeeId)
        } catch (error: any) {
          toast.error('Failed to upload photo: ' + error.message)
          setUploadingPhoto(false)
          return
        }
        setUploadingPhoto(false)
      }

      if (editingId) {
        // Update
        const { error } = await supabase
          .from('employees')
          .update({
            name: values.name,
            email: values.email || null,
            phone: values.phone,
            department_id: values.departmentId,
            designation_id: values.designationId,
            location_id: values.locationId,
            date_of_joining: values.dateOfJoining || null,
            emergency_contact_name: values.emergencyContactName || null,
            emergency_contact_phone: values.emergencyContactPhone || null,
            status: values.status,
            id_card_valid_from: values.idCardValidFrom || null,
            id_card_valid_until: values.idCardValidUntil || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (error) throw error

        // Refetch employees
        const { data } = await supabase
          .from('employees')
          .select('*, department:department_id(...), designation:designation_id(...), location:location_id(...)')
          .order('created_at', { ascending: false })

        setEmployees(data || [])
        toast.success('Employee updated successfully')
      } else {
        // Create
        const { data, error } = await supabase
          .from('employees')
          .insert({
            employee_id: generatedEmployeeId,
            name: values.name,
            email: values.email || null,
            phone: values.phone,
            department_id: values.departmentId,
            designation_id: values.designationId,
            location_id: values.locationId,
            photo_url: photoUrl,
            date_of_joining: values.dateOfJoining || null,
            emergency_contact_name: values.emergencyContactName || null,
            emergency_contact_phone: values.emergencyContactPhone || null,
            status: values.status,
            id_card_valid_from: values.idCardValidFrom || null,
            id_card_valid_until: values.idCardValidUntil || null,
            created_by: user?.id,
          })
          .select()

        if (error) throw error

        if (data) {
          setEmployees([data[0], ...employees])
          toast.success('Employee created successfully')
        }
      }

      setIsDialogOpen(false)
      setEditingId(null)
      setSelectedFile(null)
      setPhotoPreview(null)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save employee')
    }
  }

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id)
    setPhotoPreview(employee.photo_url)
    form.setValue('name', employee.name)
    form.setValue('email', employee.email || '')
    form.setValue('phone', employee.phone)
    form.setValue('departmentId', employee.department_id)
    form.setValue('designationId', employee.designation_id)
    form.setValue('locationId', employee.location_id)
    form.setValue('dateOfJoining', employee.date_of_joining || '')
    form.setValue('emergencyContactName', employee.emergency_contact_name || '')
    form.setValue('emergencyContactPhone', employee.emergency_contact_phone || '')
    form.setValue('status', employee.status as any)
    form.setValue('idCardValidFrom', employee.id_card_valid_from || '')
    form.setValue('idCardValidUntil', employee.id_card_valid_until || '')
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const employee = employees.find(e => e.id === id)
      if (employee?.photo_url) {
        await deleteEmployeePhoto(employee.photo_url)
      }

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

      if (error) throw error

      setEmployees(emps => emps.filter(e => e.id !== id))
      toast.success('Employee deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete employee')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'terminated':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
                <p className="text-gray-600">Manage employee records</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingId(null)
                    form.reset()
                    setSelectedFile(null)
                    setPhotoPreview(null)
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
                  {!editingId && (
                    <p className="text-sm text-gray-600 mt-2">
                      Employee ID: <span className="font-semibold text-gray-900">{generatedEmployeeId}</span>
                    </p>
                  )}
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Photo Upload */}
                    {!editingId && (
                      <FormItem>
                        <FormLabel>Photo</FormLabel>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                disabled={uploadingPhoto}
                              />
                            </FormControl>
                            <p className="text-xs text-gray-500 mt-1">Max 5MB, PNG/JPG/GIF</p>
                          </div>
                          {photoPreview && (
                            <div className="relative">
                              <img
                                src={photoPreview}
                                alt="Preview"
                                className="w-24 h-24 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFile(null)
                                  setPhotoPreview(null)
                                }}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </FormItem>
                    )}

                    {editingId && photoPreview && (
                      <div className="mb-4">
                        <img
                          src={photoPreview}
                          alt="Current photo"
                          className="w-24 h-24 object-cover rounded border"
                        />
                      </div>
                    )}

                    {/* Basic Info */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+91-9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Organization Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="departmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {departments.map(dept => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="designationId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Designation *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select designation" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {designations.map(desig => (
                                  <SelectItem key={desig.id} value={desig.id}>
                                    {desig.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="locationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locations.map(loc => (
                                <SelectItem key={loc.id} value={loc.id}>
                                  {loc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Employment Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dateOfJoining"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Joining</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="terminated">Terminated</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* ID Card Validity */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="idCardValidFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Card Valid From</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="idCardValidUntil"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Card Valid Until</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Emergency Contact */}
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Emergency contact name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+91-9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={uploadingPhoto}>
                      {uploadingPhoto ? 'Uploading photo...' : editingId ? 'Update' : 'Create'} Employee
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {employees.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600 mb-6">Create your first employee to get started</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Employees List</CardTitle>
              <CardDescription>Total: {employees.length} employee(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>ID Valid Until</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map(emp => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.employee_id}</TableCell>
                        <TableCell>{emp.name}</TableCell>
                        <TableCell className="text-sm">{emp.department?.name || '-'}</TableCell>
                        <TableCell className="text-sm">{emp.designation?.name || '-'}</TableCell>
                        <TableCell className="text-sm">{emp.location?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(emp.status)}>
                            {emp.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {emp.id_card_valid_until
                            ? new Date(emp.id_card_valid_until).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(emp)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(emp.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Employee</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this employee? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
