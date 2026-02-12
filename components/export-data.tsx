"use client"

import { useEffect, useState } from "react"
import { Download, FileSpreadsheet, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getEmployees, exportToCSV } from "@/lib/store"
import { DESIGNATION_LABELS, STATUS_LABELS, type Employee } from "@/lib/types"
import { toast } from "sonner"

export function ExportData() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filterDesignation, setFilterDesignation] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    setEmployees(getEmployees())
  }, [])

  const filtered = employees.filter((e) => {
    const matchesDesignation = filterDesignation === "all" || e.designation === filterDesignation
    const matchesStatus = filterStatus === "all" || e.employmentStatus === filterStatus
    return matchesDesignation && matchesStatus
  })

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error("No employees to export")
      return
    }
    const csv = exportToCSV(filtered)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `secureforce-employees-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${filtered.length} employee records`)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Export Employee Data</CardTitle>
              <CardDescription>Download employee records as a CSV file</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={filterDesignation} onValueChange={setFilterDesignation}>
                <SelectTrigger className="w-full sm:w-[200px]">
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
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {filtered.length} employee{filtered.length !== 1 ? "s" : ""} matching filters
                </span>
              </div>
              <Button onClick={handleExport} disabled={filtered.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview of data to be exported */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Data Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">Designation</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 20).map((emp) => (
                  <tr key={emp.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-mono text-sm text-foreground">{emp.employeeId}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-foreground">{emp.name}</td>
                    <td className="hidden px-4 py-2.5 text-sm text-muted-foreground sm:table-cell">{DESIGNATION_LABELS[emp.designation]}</td>
                    <td className="hidden max-w-[200px] truncate px-4 py-2.5 text-sm text-muted-foreground md:table-cell">{emp.assignedLocation}</td>
                    <td className="px-4 py-2.5">
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
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No employees match the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 20 && (
            <div className="border-t border-border px-4 py-3 text-center text-sm text-muted-foreground">
              Showing first 20 of {filtered.length} records. All records will be included in the export.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
