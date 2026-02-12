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
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Designation, Department } from '@/lib/validators'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { designationFormSchema, type DesignationFormInput } from '@/lib/validators'
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

export default function DesignationsPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const [designations, setDesignations] = useState<(Designation & { department?: Department })[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const form = useForm<DesignationFormInput>({
    resolver: zodResolver(designationFormSchema),
    defaultValues: {
      name: '',
      departmentId: '',
      description: '',
    },
  })

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const { data: deptsData, error: deptsError } = await supabase
          .from('departments')
          .select('*')

        if (deptsError) throw deptsError
        setDepartments(deptsData || [])

        // Fetch designations with department info
        const { data: desigData, error: desigError } = await supabase
          .from('designations')
          .select('*, department:department_id(...)')
          .order('created_at', { ascending: false })

        if (desigError) throw desigError
        setDesignations(desigData || [])
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

  const onSubmit = async (values: DesignationFormInput) => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('designations')
          .update({
            name: values.name,
            department_id: values.departmentId,
            description: values.description || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (error) throw error

        const updatedDesig = designations.find(d => d.id === editingId)
        if (updatedDesig) {
          const dept = departments.find(d => d.id === values.departmentId)
          setDesignations(desigs =>
            desigs.map(d =>
              d.id === editingId
                ? {
                    ...d,
                    name: values.name,
                    department_id: values.departmentId,
                    description: values.description || null,
                    department: dept,
                    updated_at: new Date().toISOString(),
                  }
                : d
            )
          )
        }
        toast.success('Designation updated successfully')
      } else {
        const { data, error } = await supabase
          .from('designations')
          .insert({
            name: values.name,
            department_id: values.departmentId,
            description: values.description || null,
          })
          .select()

        if (error) throw error

        if (data) {
          const dept = departments.find(d => d.id === values.departmentId)
          setDesignations([{ ...data[0], department: dept }, ...designations])
          toast.success('Designation created successfully')
        }
      }

      setIsDialogOpen(false)
      setEditingId(null)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save designation')
    }
  }

  const handleEdit = (designation: Designation) => {
    setEditingId(designation.id)
    form.setValue('name', designation.name)
    form.setValue('departmentId', designation.department_id)
    form.setValue('description', designation.description || '')
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact' })
        .eq('designation_id', id)

      if (count && count > 0) {
        toast.error('Cannot delete designation with existing employees')
        return
      }

      const { error } = await supabase
        .from('designations')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDesignations(desigs => desigs.filter(d => d.id !== id))
      toast.success('Designation deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete designation')
    } finally {
      setDeleteConfirm(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Loading designations...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Designations</h1>
                <p className="text-gray-600">Manage job designations</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingId(null)
                    form.reset()
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Designation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Designation' : 'Add Designation'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Security Guard" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Job description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full">
                      {editingId ? 'Update' : 'Create'} Designation
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
        {designations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No designations found</h3>
              <p className="text-gray-600 mb-6">Create your first designation to get started</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Designations List</CardTitle>
              <CardDescription>Total: {designations.length} designation(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {designations.map(desig => (
                      <TableRow key={desig.id}>
                        <TableCell className="font-medium">{desig.name}</TableCell>
                        <TableCell>{desig.department?.name || '-'}</TableCell>
                        <TableCell className="text-gray-600 text-sm">{desig.description || '-'}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(desig.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(desig)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(desig.id)}
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
          <AlertDialogTitle>Delete Designation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this designation? This action cannot be undone.
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
