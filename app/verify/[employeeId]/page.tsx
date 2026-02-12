'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Shield, CheckCircle2, XCircle, MapPin, Calendar, Phone, Briefcase, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { Employee } from '@/lib/validators'

interface EmployeeWithRelations extends Employee {
  department?: any
  designation?: any
  location?: any
}

type VerificationStatus = 'valid' | 'expired' | 'inactive' | 'invalid'

export default function VerifyPage() {
  const params = useParams()
  const employeeId = params.employeeId as string
  const [employee, setEmployee] = useState<EmployeeWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<VerificationStatus>('invalid')
  const [companySettings, setCompanySettings] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employee
        const { data: emp, error: empError } = await supabase
          .from('employees')
          .select('*, department:department_id(...), designation:designation_id(...), location:location_id(...)')
          .eq('employee_id', employeeId)
          .single()

        if (empError || !emp) {
          setStatus('invalid')
          setLoading(false)
          return
        }

        setEmployee(emp)

        // Determine status
        const today = new Date()
        const validUntil = emp.id_card_valid_until ? new Date(emp.id_card_valid_until) : null

        if (emp.status === 'active' && validUntil && validUntil >= today) {
          setStatus('valid')
        } else if (validUntil && validUntil < today) {
          setStatus('expired')
        } else if (emp.status !== 'active') {
          setStatus('inactive')
        } else {
          setStatus('invalid')
        }

        // Fetch company settings
        const { data: settings } = await supabase
          .from('company_settings')
          .select('*')
          .limit(1)
          .single()

        setCompanySettings(settings)
      } catch (error) {
        console.error('Error fetching verification data:', error)
        setStatus('invalid')
      } finally {
        setLoading(false)
      }
    }

    if (employeeId) {
      fetchData()
    }
  }, [employeeId])

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="mt-4 text-white">Verifying employee ID...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-900 to-blue-800">
      {/* Header */}
      <header className="flex items-center justify-center gap-2 border-b border-blue-700 bg-blue-800 px-4 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
          <Shield className="h-6 w-6 text-blue-900" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">SecureForce Verification</h1>
          {companySettings && (
            <p className="text-xs text-blue-100">{companySettings.company_name}</p>
          )}
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md overflow-hidden shadow-2xl">
          <CardContent className="p-6">
            {status === 'invalid' ? (
              /* Invalid / Not Found */
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-600">INVALID</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Employee ID <span className="font-mono font-semibold text-gray-900">{employeeId}</span> was not
                    found in our records.
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  If you believe this is an error, please contact management.
                </p>
              </div>
            ) : status === 'valid' ? (
              /* Valid */
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-green-600">VALID</h2>
                  <p className="mt-1 text-sm text-gray-600">Employee is verified and authorized</p>
                </div>

                {/* Employee Info */}
                <div className="flex w-full items-center gap-4 rounded-lg bg-gray-50 p-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={employee?.photo_url || undefined} alt={employee?.name} />
                    <AvatarFallback className="bg-green-100 text-green-700 text-lg font-bold">
                      {employee?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'EM'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-lg">{employee?.name}</h3>
                    <p className="font-mono text-xs text-gray-500">{employee?.employee_id}</p>
                    {employee?.designation && (
                      <Badge className="mt-2 bg-green-100 text-green-800">{employee.designation.name}</Badge>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid w-full grid-cols-1 gap-3">
                  {employee?.designation && (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                      <Briefcase className="h-4 w-4 flex-shrink-0 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Position</p>
                        <p className="text-sm font-medium text-gray-900">{employee.designation.name}</p>
                      </div>
                    </div>
                  )}

                  {employee?.department && (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                      <Building2 className="h-4 w-4 flex-shrink-0 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="text-sm font-medium text-gray-900">{employee.department.name}</p>
                      </div>
                    </div>
                  )}

                  {employee?.location && (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Assigned Location</p>
                        <p className="text-sm font-medium text-gray-900">{employee.location.name}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">ID Valid Until</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(employee?.id_card_valid_until)}</p>
                    </div>
                  </div>

                  {employee?.phone && (
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                      <Phone className="h-4 w-4 flex-shrink-0 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-sm font-medium text-gray-900">{employee.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-xs text-green-700 font-semibold">✓ This employee is verified and authorized</p>
                </div>
              </div>
            ) : (
              /* Expired or Inactive */
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-red-600">{status === 'expired' ? 'EXPIRED' : 'INACTIVE'}</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {status === 'expired'
                      ? "This employee's ID card has expired"
                      : 'This employee is currently not active'}
                  </p>
                </div>

                {/* Employee Info - Reduced */}
                <div className="flex w-full items-center gap-4 rounded-lg bg-gray-50 p-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={employee?.photo_url || undefined} alt={employee?.name} />
                    <AvatarFallback className="bg-red-100 text-red-700">
                      {employee?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'EM'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee?.name}</h3>
                    <p className="font-mono text-xs text-gray-500">{employee?.employee_id}</p>
                  </div>
                </div>

                <div className="grid w-full grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                    <Shield className="h-4 w-4 flex-shrink-0 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-medium text-red-600 capitalize font-semibold">{employee?.status}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">ID {status === 'expired' ? 'Expired On' : 'Valid Until'}</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(employee?.id_card_valid_until)}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full rounded-lg bg-red-50 p-3 text-center">
                  <p className="text-xs text-red-700 font-semibold">
                    Please contact management for verification or renewal
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-blue-700 bg-blue-800 px-4 py-4 text-center text-xs text-blue-100">
        <p className="font-semibold">{companySettings?.company_name || 'SecureForce'}</p>
        <p className="mt-1">Employee Verification System</p>
        {companySettings?.phone && (
          <p className="mt-1 text-blue-200">Contact: {companySettings.phone}</p>
        )}
      </footer>
    </div>
  )
}
