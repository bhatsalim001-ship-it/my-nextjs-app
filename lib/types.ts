export type Designation = "security-guard" | "supervisor" | "housekeeping"

export type EmploymentStatus = "active" | "inactive" | "terminated"

export interface Employee {
  id: string
  employeeId: string
  name: string
  photo: string
  designation: Designation
  contactNumber: string
  email: string
  dateOfJoining: string
  assignedLocation: string
  emergencyContact: string
  emergencyContactName: string
  employmentStatus: EmploymentStatus
  idCardValidFrom: string
  idCardValidUntil: string
  createdAt: string
  updatedAt: string
}

export const DESIGNATION_LABELS: Record<Designation, string> = {
  "security-guard": "Security Guard",
  supervisor: "Supervisor",
  housekeeping: "Housekeeping",
}

export const STATUS_LABELS: Record<EmploymentStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  terminated: "Terminated",
}

export const LOCATIONS = [
  "District Hospital, Sector 12",
  "Government Medical College",
  "Civil Hospital, Main Road",
  "PHC Greenfield",
  "Sub-District Hospital, Block A",
  "Municipal Office, City Center",
  "Revenue Office, Block B",
  "Collector Office",
]
