import type { Employee } from "./types"

const STORAGE_KEY = "secureforce-employees"

function generateId(): string {
  return crypto.randomUUID()
}

function generateEmployeeId(): string {
  const prefix = "SF"
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${num}`
}

export function getEmployees(): Employee[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) {
    const sample = getSampleData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sample))
    return sample
  }
  return JSON.parse(data) as Employee[]
}

export function getEmployee(id: string): Employee | undefined {
  const employees = getEmployees()
  return employees.find((e) => e.id === id)
}

export function getEmployeeByEmployeeId(employeeId: string): Employee | undefined {
  const employees = getEmployees()
  return employees.find((e) => e.employeeId === employeeId)
}

export function addEmployee(employee: Omit<Employee, "id" | "employeeId" | "createdAt" | "updatedAt">): Employee {
  const employees = getEmployees()
  const newEmployee: Employee = {
    ...employee,
    id: generateId(),
    employeeId: generateEmployeeId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  employees.push(newEmployee)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees))
  return newEmployee
}

export function updateEmployee(id: string, updates: Partial<Employee>): Employee | undefined {
  const employees = getEmployees()
  const index = employees.findIndex((e) => e.id === id)
  if (index === -1) return undefined
  employees[index] = {
    ...employees[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees))
  return employees[index]
}

export function deleteEmployee(id: string): boolean {
  const employees = getEmployees()
  const filtered = employees.filter((e) => e.id !== id)
  if (filtered.length === employees.length) return false
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export function exportToCSV(employees: Employee[]): string {
  const headers = [
    "Employee ID",
    "Name",
    "Designation",
    "Contact Number",
    "Email",
    "Date of Joining",
    "Assigned Location",
    "Emergency Contact Name",
    "Emergency Contact",
    "Employment Status",
    "ID Valid From",
    "ID Valid Until",
  ]
  const rows = employees.map((e) => [
    e.employeeId,
    e.name,
    e.designation,
    e.contactNumber,
    e.email,
    e.dateOfJoining,
    e.assignedLocation,
    e.emergencyContactName,
    e.emergencyContact,
    e.employmentStatus,
    e.idCardValidFrom,
    e.idCardValidUntil,
  ])
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n")
  return csv
}

function getSampleData(): Employee[] {
  const now = new Date().toISOString()
  return [
    {
      id: generateId(),
      employeeId: "SF-1001",
      name: "Rajesh Kumar",
      photo: "",
      designation: "security-guard",
      contactNumber: "+91 98765 43210",
      email: "rajesh.kumar@example.com",
      dateOfJoining: "2023-03-15",
      assignedLocation: "District Hospital, Sector 12",
      emergencyContact: "+91 98765 43211",
      emergencyContactName: "Meena Kumar",
      employmentStatus: "active",
      idCardValidFrom: "2025-01-01",
      idCardValidUntil: "2026-12-31",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      employeeId: "SF-1002",
      name: "Priya Sharma",
      photo: "",
      designation: "supervisor",
      contactNumber: "+91 87654 32109",
      email: "priya.sharma@example.com",
      dateOfJoining: "2022-08-01",
      assignedLocation: "Government Medical College",
      emergencyContact: "+91 87654 32110",
      emergencyContactName: "Amit Sharma",
      employmentStatus: "active",
      idCardValidFrom: "2025-01-01",
      idCardValidUntil: "2026-12-31",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      employeeId: "SF-1003",
      name: "Suresh Yadav",
      photo: "",
      designation: "housekeeping",
      contactNumber: "+91 76543 21098",
      email: "suresh.yadav@example.com",
      dateOfJoining: "2024-01-10",
      assignedLocation: "Civil Hospital, Main Road",
      emergencyContact: "+91 76543 21099",
      emergencyContactName: "Sunita Yadav",
      employmentStatus: "active",
      idCardValidFrom: "2025-01-01",
      idCardValidUntil: "2026-12-31",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      employeeId: "SF-1004",
      name: "Anita Verma",
      photo: "",
      designation: "security-guard",
      contactNumber: "+91 65432 10987",
      email: "anita.verma@example.com",
      dateOfJoining: "2023-11-20",
      assignedLocation: "Municipal Office, City Center",
      emergencyContact: "+91 65432 10988",
      emergencyContactName: "Ravi Verma",
      employmentStatus: "active",
      idCardValidFrom: "2025-01-01",
      idCardValidUntil: "2026-12-31",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      employeeId: "SF-1005",
      name: "Mohammed Irfan",
      photo: "",
      designation: "security-guard",
      contactNumber: "+91 54321 09876",
      email: "mohammed.irfan@example.com",
      dateOfJoining: "2022-05-12",
      assignedLocation: "Collector Office",
      emergencyContact: "+91 54321 09877",
      emergencyContactName: "Fatima Irfan",
      employmentStatus: "inactive",
      idCardValidFrom: "2024-01-01",
      idCardValidUntil: "2025-06-30",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      employeeId: "SF-1006",
      name: "Lakshmi Devi",
      photo: "",
      designation: "housekeeping",
      contactNumber: "+91 43210 98765",
      email: "lakshmi.devi@example.com",
      dateOfJoining: "2024-06-01",
      assignedLocation: "PHC Greenfield",
      emergencyContact: "+91 43210 98766",
      emergencyContactName: "Venkat Rao",
      employmentStatus: "active",
      idCardValidFrom: "2025-01-01",
      idCardValidUntil: "2026-12-31",
      createdAt: now,
      updatedAt: now,
    },
  ]
}
