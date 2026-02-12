"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import { LOCATIONS, type Designation, type Employee, type EmploymentStatus } from "@/lib/types"

interface EmployeeFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Employee, "id" | "employeeId" | "createdAt" | "updatedAt">) => void
  employee?: Employee
}

export function EmployeeForm({ open, onClose, onSubmit, employee }: EmployeeFormProps) {
  const [name, setName] = useState(employee?.name || "")
  const [photo, setPhoto] = useState(employee?.photo || "")
  const [designation, setDesignation] = useState<Designation>(employee?.designation || "security-guard")
  const [contactNumber, setContactNumber] = useState(employee?.contactNumber || "")
  const [email, setEmail] = useState(employee?.email || "")
  const [dateOfJoining, setDateOfJoining] = useState(employee?.dateOfJoining || "")
  const [assignedLocation, setAssignedLocation] = useState(employee?.assignedLocation || "")
  const [emergencyContact, setEmergencyContact] = useState(employee?.emergencyContact || "")
  const [emergencyContactName, setEmergencyContactName] = useState(employee?.emergencyContactName || "")
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>(employee?.employmentStatus || "active")
  const [idCardValidFrom, setIdCardValidFrom] = useState(employee?.idCardValidFrom || new Date().toISOString().split("T")[0])
  const [idCardValidUntil, setIdCardValidUntil] = useState(
    employee?.idCardValidUntil ||
      new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0]
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      photo,
      designation,
      contactNumber,
      email,
      dateOfJoining,
      assignedLocation,
      emergencyContact,
      emergencyContactName,
      employmentStatus,
      idCardValidFrom,
      idCardValidUntil,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Photo */}
          <div className="flex flex-col items-center gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={photo || "/placeholder.svg"} />
                <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                  {name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Camera className="h-3.5 w-3.5" />
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <p className="text-xs text-muted-foreground">Click to upload photo</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="name" className="text-foreground">Full Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="text-base" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="designation" className="text-foreground">Designation *</Label>
              <Select value={designation} onValueChange={(v) => setDesignation(v as Designation)}>
                <SelectTrigger id="designation"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="security-guard">Security Guard</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status" className="text-foreground">Status *</Label>
              <Select value={employmentStatus} onValueChange={(v) => setEmploymentStatus(v as EmploymentStatus)}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact" className="text-foreground">Contact Number *</Label>
              <Input id="contact" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required className="text-base" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-base" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doj" className="text-foreground">Date of Joining *</Label>
              <Input id="doj" type="date" value={dateOfJoining} onChange={(e) => setDateOfJoining(e.target.value)} required className="text-base" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location" className="text-foreground">Assigned Location *</Label>
              <Select value={assignedLocation} onValueChange={setAssignedLocation}>
                <SelectTrigger id="location"><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ecName" className="text-foreground">Emergency Contact Name</Label>
              <Input id="ecName" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} className="text-base" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ec" className="text-foreground">Emergency Contact Number</Label>
              <Input id="ec" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} className="text-base" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="validFrom" className="text-foreground">ID Valid From</Label>
              <Input id="validFrom" type="date" value={idCardValidFrom} onChange={(e) => setIdCardValidFrom(e.target.value)} className="text-base" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="validUntil" className="text-foreground">ID Valid Until</Label>
              <Input id="validUntil" type="date" value={idCardValidUntil} onChange={(e) => setIdCardValidUntil(e.target.value)} className="text-base" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{employee ? "Update" : "Add Employee"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
