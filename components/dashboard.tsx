"use client"

import { useEffect, useState } from "react"
import { Users, ShieldCheck, UserCog, Sparkles, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getEmployees } from "@/lib/store"
import { DESIGNATION_LABELS, type Employee } from "@/lib/types"

export function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    setEmployees(getEmployees())
  }, [])

  const totalActive = employees.filter((e) => e.employmentStatus === "active").length
  const totalInactive = employees.filter((e) => e.employmentStatus === "inactive").length
  const guards = employees.filter((e) => e.designation === "security-guard").length
  const supervisors = employees.filter((e) => e.designation === "supervisor").length
  const housekeeping = employees.filter((e) => e.designation === "housekeeping").length

  const locationMap = new Map<string, number>()
  for (const emp of employees.filter((e) => e.employmentStatus === "active")) {
    locationMap.set(emp.assignedLocation, (locationMap.get(emp.assignedLocation) || 0) + 1)
  }

  const recentEmployees = [...employees]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold text-foreground">{employees.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <ShieldCheck className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Deployments</p>
              <p className="text-2xl font-bold text-foreground">{totalActive}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-chart-3/10">
              <UserCog className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold text-foreground">{totalInactive}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-chart-5/10">
              <Sparkles className="h-6 w-6 text-chart-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Locations</p>
              <p className="text-2xl font-bold text-foreground">{locationMap.size}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Designation breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">By Designation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Security Guards</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${(guards / Math.max(employees.length, 1)) * 120}px` }} />
                  <span className="text-sm font-semibold text-foreground">{guards}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Supervisors</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${(supervisors / Math.max(employees.length, 1)) * 120}px` }} />
                  <span className="text-sm font-semibold text-foreground">{supervisors}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Housekeeping</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-chart-3" style={{ width: `${(housekeeping / Math.max(employees.length, 1)) * 120}px` }} />
                  <span className="text-sm font-semibold text-foreground">{housekeeping}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location deployments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Active Deployments by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {Array.from(locationMap.entries()).map(([loc, count]) => (
                <div key={loc} className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm text-foreground">{loc}</span>
                  <Badge variant="secondary" className="text-foreground">{count}</Badge>
                </div>
              ))}
              {locationMap.size === 0 && (
                <p className="text-sm text-muted-foreground">No active deployments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent employees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Recent Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</th>
                  <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="hidden pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">Designation</th>
                  <th className="hidden pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Location</th>
                  <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-border last:border-0">
                    <td className="py-3 font-mono text-sm text-foreground">{emp.employeeId}</td>
                    <td className="py-3 text-sm font-medium text-foreground">{emp.name}</td>
                    <td className="hidden py-3 text-sm text-muted-foreground sm:table-cell">{DESIGNATION_LABELS[emp.designation]}</td>
                    <td className="hidden max-w-[200px] truncate py-3 text-sm text-muted-foreground md:table-cell">{emp.assignedLocation}</td>
                    <td className="py-3">
                      <Badge
                        variant={emp.employmentStatus === "active" ? "default" : "secondary"}
                        className={
                          emp.employmentStatus === "active"
                            ? "bg-accent text-accent-foreground"
                            : emp.employmentStatus === "inactive"
                              ? "bg-chart-3/15 text-chart-3"
                              : "bg-destructive/15 text-destructive"
                        }
                      >
                        {emp.employmentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
