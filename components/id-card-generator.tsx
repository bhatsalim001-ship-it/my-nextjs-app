"use client"

import { useEffect, useState, useRef } from "react"
import { Printer, Search, CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IdCard } from "./id-card"
import { getEmployees } from "@/lib/store"
import { DESIGNATION_LABELS, type Employee } from "@/lib/types"

export function IdCardGenerator() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState("")
  const [filterDesignation, setFilterDesignation] = useState<string>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [previewEmployee, setPreviewEmployee] = useState<Employee | null>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const [baseUrl, setBaseUrl] = useState("")

  useEffect(() => {
    setEmployees(getEmployees())
    setBaseUrl(window.location.origin)
  }, [])

  const activeEmployees = employees.filter((e) => e.employmentStatus === "active")

  const filtered = activeEmployees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase())
    const matchesDesignation = filterDesignation === "all" || e.designation === filterDesignation
    return matchesSearch && matchesDesignation
  })

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((e) => e.id)))
    }
  }

  const selectedEmployees = employees.filter((e) => selectedIds.has(e.id))

  const handlePrint = () => {
    if (!printRef.current) return
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const content = printRef.current.innerHTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SecureForce - ID Cards</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', system-ui, sans-serif; }
            @page { size: landscape; margin: 0.25in; }
            .id-cards-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
              justify-content: center;
            }
            .id-card {
              border: 1px solid #ddd;
              border-radius: 12px;
              overflow: hidden;
              width: 3.375in;
              height: 2.125in;
              page-break-inside: avoid;
              background: white;
            }
          </style>
        </head>
        <body>
          <div class="id-cards-grid">
            ${content}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
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
          <Button
            onClick={handlePrint}
            disabled={selectedIds.size === 0}
            className="flex-shrink-0"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print ({selectedIds.size})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Employee selection list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">Select Employees</CardTitle>
            <Button variant="ghost" size="sm" onClick={toggleAll} className="h-8">
              {selectedIds.size === filtered.length && filtered.length > 0 ? (
                <CheckSquare className="mr-1 h-4 w-4" />
              ) : (
                <Square className="mr-1 h-4 w-4" />
              )}
              {selectedIds.size === filtered.length && filtered.length > 0 ? "Deselect All" : "Select All"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex max-h-[500px] flex-col gap-2 overflow-y-auto">
              {filtered.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => toggleSelect(emp.id)}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    selectedIds.has(emp.id)
                      ? "border-primary/30 bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${
                      selectedIds.has(emp.id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {selectedIds.has(emp.id) && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {emp.employeeId} - {DESIGNATION_LABELS[emp.designation]}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewEmployee(emp)
                    }}
                  >
                    Preview
                  </Button>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No active employees found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Card Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {previewEmployee ? (
              <>
                <IdCard employee={previewEmployee} baseUrl={baseUrl} />
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-foreground">{previewEmployee.employeeId}</Badge>
                  <Badge variant="secondary" className="text-foreground">{DESIGNATION_LABELS[previewEmployee.designation]}</Badge>
                </div>
              </>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                Select an employee to preview their ID card
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hidden print area */}
      <div ref={printRef} className="hidden print-area">
        {selectedEmployees.map((emp) => (
          <IdCard key={emp.id} employee={emp} baseUrl={baseUrl} />
        ))}
      </div>
    </div>
  )
}
