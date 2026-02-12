"use client"

import { QRCodeSVG } from "qrcode.react"
import { Shield } from "lucide-react"
import { DESIGNATION_LABELS, type Employee } from "@/lib/types"

interface IdCardProps {
  employee: Employee
  baseUrl: string
}

export function IdCard({ employee, baseUrl }: IdCardProps) {
  const verifyUrl = `${baseUrl}/verify/${employee.employeeId}`

  return (
    <div
      className="id-card relative overflow-hidden rounded-xl border border-border bg-card"
      style={{ width: "3.375in", height: "2.125in" }}
    >
      {/* Top colored bar */}
      <div className="flex h-[42px] items-center gap-2 bg-primary px-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-foreground/20">
          <Shield className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            SecureForce Security Agency
          </p>
          <p className="text-[7px] text-primary-foreground/70">Government Authorized Personnel</p>
        </div>
      </div>

      {/* Card body */}
      <div className="flex gap-2.5 px-3 pt-2">
        {/* Photo */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-[60px] w-[50px] items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
            {employee.photo ? (
              <img src={employee.photo || "/placeholder.svg"} alt={employee.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground">
                {employee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            )}
          </div>
          <span
            className="inline-block rounded bg-accent px-1.5 py-0.5 text-center text-[6px] font-bold uppercase text-accent-foreground"
          >
            {DESIGNATION_LABELS[employee.designation]}
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-[11px] font-bold text-foreground">{employee.name}</p>
          <p className="font-mono text-[9px] text-muted-foreground">ID: {employee.employeeId}</p>
          <div className="mt-0.5 flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1">
              <span className="text-[7px] text-muted-foreground">Location:</span>
              <span className="text-[7px] font-medium text-foreground">{employee.assignedLocation}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[7px] text-muted-foreground">Valid:</span>
              <span className="text-[7px] font-medium text-foreground">
                {employee.idCardValidFrom} to {employee.idCardValidUntil}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-0.5">
          <QRCodeSVG value={verifyUrl} size={52} level="M" />
          <p className="text-[5px] text-muted-foreground">Scan to verify</p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-muted px-3 py-1">
        <p className="text-[6px] text-muted-foreground">This card is the property of SecureForce Agency</p>
        <p className="text-[6px] font-medium text-muted-foreground">
          {employee.contactNumber}
        </p>
      </div>
    </div>
  )
}
