'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Location } from '@/lib/validators'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { locationFormSchema, type LocationFormInput } from '@/lib/validators'
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

export default function LocationsPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const form = useForm<LocationFormInput>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      phone: '',
      email: '',
    },
  })

  // Load locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setLocations(data || [])
      } catch (error) {
        toast.error('Failed to load locations')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  // Check authorization
  useEffect(() => {
    if (!user || !['admin', 'super_admin'].includes(userRole || '')) {
      router.push('/admin/dashboard')
      toast.error('Unauthorized access')
    }
  }, [user, userRole, router])

  const onSubmit = async (values: LocationFormInput) => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from('locations')
          .update({
            name: values.name,
            address: values.address || null,
            city: values.city || null,
            state: values.state || null,
            phone: values.phone || null,
            email: values.email || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (error) throw error

        setLocations(locs =>
          locs.map(l =>
            l.id === editingId
              ? {
                  ...l,
                  name: values.name,
                  address: values.address || null,
                  city: values.city || null,
                  state: values.state || null,
                  phone: values.phone || null,
                  email: values.email || null,
                  updated_at: new Date().toISOString(),
                }
              : l
          )
        )
        toast.success('Location updated successfully')
      } else {
        const { data, error } = await supabase
          .from('locations')
          .insert({
            name: values.name,
            address: values.address || null,
            city: values.city || null,
            state: values.state || null,
            phone: values.phone || null,
            email: values.email || null,
          })
          .select()

        if (error) throw error

        if (data) {
          setLocations([data[0], ...locations])
          toast.success('Location created successfully')
        }
      }

      setIsDialogOpen(false)
      setEditingId(null)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save location')
    }
  }

  const handleEdit = (location: Location) => {
    setEditingId(location.id)
    form.setValue('name', location.name)
    form.setValue('address', location.address || '')
    form.setValue('city', location.city || '')
    form.setValue('state', location.state || '')
    form.setValue('phone', location.phone || '')
    form.setValue('email', location.email || '')
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact' })
        .eq('location_id', id)

      if (count && count > 0) {
        toast.error('Cannot delete location with existing employees')
        return
      }

      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)

      if (error) throw error

      setLocations(locs => locs.filter(l => l.id !== id))
      toast.success('Location deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete location')
    } finally {
      setDeleteConfirm(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">Loading locations...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
                <p className="text-gray-600">Manage office locations</p>
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
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Location' : 'Add Location'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., New Delhi Office" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Street address..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+91-..." {...field} />
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
                              <Input placeholder="office@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      {editingId ? 'Update' : 'Create'} Location
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
        {locations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No locations found</h3>
              <p className="text-gray-600 mb-6">Create your first location to get started</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Locations List</CardTitle>
              <CardDescription>Total: {locations.length} location(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map(loc => (
                      <TableRow key={loc.id}>
                        <TableCell className="font-medium">{loc.name}</TableCell>
                        <TableCell>{loc.city || '-'}</TableCell>
                        <TableCell className="text-sm">{loc.phone || '-'}</TableCell>
                        <TableCell className="text-sm">{loc.email || '-'}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(loc.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(loc)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(loc.id)}
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
          <AlertDialogTitle>Delete Location</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this location? This action cannot be undone.
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
