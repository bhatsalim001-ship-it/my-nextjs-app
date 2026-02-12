"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Search, Edit2, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmployeeForm } from "./employee-form"
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from "@/lib/store"
import { DESIGNATION_LABELS, STATUS_LABELS, type Employee, type Designation } from "@/lib/types"
import { toast } from "sonner"

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState("")
  const [filterDesignation, setFilterDesignation] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null)

  const refresh = useCallback(() => {
    setEmployees(getEmployees())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const filtered = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.assignedLocation.toLowerCase().includes(search.toLowerCase())
    const matchesDesignation = filterDesignation === "all" || e.designation === filterDesignation
    const matchesStatus = filterStatus === "all" || e.employmentStatus === filterStatus
    return matchesSearch && matchesDesignation && matchesStatus
  })

  const handleAdd = (data: Omit<Employee, "id" | "employeeId" | "createdAt" | "updatedAt">) => {
    addEmployee(data)
    refresh()
    toast.success("Employee added successfully")
  }

  const handleEdit = (data: Omit<Employee, "id" | "employeeId" | "createdAt" | "updatedAt">) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, data)
      refresh()
      setEditingEmployee(undefined)
      toast.success("Employee updated successfully")
    }
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteEmployee(deleteId)
      refresh()
      setDeleteId(null)
      toast.success("Employee deleted successfully")
    }
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-base"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterDesignation} onValueChange={setFilterDesignation}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Designation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Designations</SelectItem>
              <SelectItem value="security-guard">Security Guard</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="housekeeping">Housekeeping</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowForm(true)} className="flex-shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Employee</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Employee table / cards */}
      {/* Desktop table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Designation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={emp.photo || "/placeholder.svg"} />
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">
                            {getInitials(emp.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-foreground">{emp.employeeId}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{DESIGNATION_LABELS[emp.designation]}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-sm text-muted-foreground">{emp.assignedLocation}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={
                          emp.employmentStatus === "active"
                            ? "bg-accent/15 text-accent"
                            : emp.employmentStatus === "inactive"
                              ? "bg-chart-3/15 text-chart-3"
                              : "bg-destructive/15 text-destructive"
                        }
                      >
                        {STATUS_LABELS[emp.employmentStatus]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewEmployee(emp)} className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingEmployee(emp)
                            setShowForm(true)
                          }}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(emp.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((emp) => (
          <Card key={emp.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={emp.photo || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-sm text-primary">
                    {getInitials(emp.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{emp.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{emp.employeeId}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        emp.employmentStatus === "active"
                          ? "bg-accent/15 text-accent"
                          : emp.employmentStatus === "inactive"
                            ? "bg-chart-3/15 text-chart-3"
                            : "bg-destructive/15 text-destructive"
                      }
                    >
                      {STATUS_LABELS[emp.employmentStatus]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{DESIGNATION_LABELS[emp.designation]}</p>
                  <p className="text-sm text-muted-foreground">{emp.assignedLocation}</p>
                  <div className="mt-3 flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => setViewEmployee(emp)} className="h-8">
                      <Eye className="mr-1 h-3.5 w-3.5" /> View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingEmployee(emp)
                        setShowForm(true)
                      }}
                      className="h-8"
                    >
                      <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteId(emp.id)} className="h-8 text-destructive hover:text-destructive">
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No employees found</p>
        )}
      </div>

      {/* Form dialog */}
      {showForm && (
        <EmployeeForm
          open={showForm}
          onClose={() => {
            setShowForm(false)
            setEditingEmployee(undefined)
          }}
          onSubmit={editingEmployee ? handleEdit : handleAdd}
          employee={editingEmployee}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View dialog */}
      <Dialog open={!!viewEmployee} onOpenChange={() => setViewEmployee(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Employee Details</DialogTitle>
          </DialogHeader>
          {viewEmployee && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={viewEmployee.photo || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-lg text-primary">
                    {getInitials(viewEmployee.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{viewEmployee.name}</h3>
                  <p className="font-mono text-sm text-muted-foreground">{viewEmployee.employeeId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Designation</p>
                  <p className="font-medium text-foreground">{DESIGNATION_LABELS[viewEmployee.designation]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground">{STATUS_LABELS[viewEmployee.employmentStatus]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contact</p>
                  <p className="font-medium text-foreground">{viewEmployee.contactNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{viewEmployee.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date of Joining</p>
                  <p className="font-medium text-foreground">{viewEmployee.dateOfJoining}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{viewEmployee.assignedLocation}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Emergency Contact</p>
                  <p className="font-medium text-foreground">{viewEmployee.emergencyContactName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Emergency Number</p>
                  <p className="font-medium text-foreground">{viewEmployee.emergencyContact || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ID Valid From</p>
                  <p className="font-medium text-foreground">{viewEmployee.idCardValidFrom}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ID Valid Until</p>
                  <p className="font-medium text-foreground">{viewEmployee.idCardValidUntil}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
