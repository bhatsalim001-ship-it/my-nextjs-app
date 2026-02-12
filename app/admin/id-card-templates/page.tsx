'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CARD_TEMPLATES, CardTemplate } from '@/lib/card-templates'
import { IdCard } from '@/components/id-card-renderer'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function IdCardTemplatesPage() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(CARD_TEMPLATES[0])
  const [defaultTemplate, setDefaultTemplate] = useState<string>(CARD_TEMPLATES[0].id)

  useEffect(() => {
    if (!user || !['admin', 'super_admin'].includes(userRole || '')) {
      router.push('/admin/dashboard')
      toast.error('Unauthorized access')
    }
  }, [user, userRole, router])

  const handleSetDefault = (templateId: string) => {
    setDefaultTemplate(templateId)
    toast.success('Default template updated')
  }

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      Professional: 'bg-blue-100 text-blue-800',
      Modern: 'bg-purple-100 text-purple-800',
      Premium: 'bg-yellow-100 text-yellow-800',
      Security: 'bg-red-100 text-red-800',
      Specialized: 'bg-green-100 text-green-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  // Sample employee for preview
  const sampleEmployee = {
    id: 'sample-id',
    employee_id: 'SF-0001',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91-9876543210',
    department_id: 'dept-1',
    designation_id: 'desig-1',
    location_id: 'loc-1',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    date_of_joining: '2024-01-15',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '+91-9876543211',
    status: 'active' as const,
    id_card_valid_from: '2024-01-01',
    id_card_valid_until: '2026-12-31',
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    department: { name: 'Security', id: 'dept-1' },
    designation: { name: 'Security Guard', id: 'desig-1' },
    location: { name: 'New Delhi Office', id: 'loc-1' },
  }

  const sampleSettings = {
    company_name: 'SecureForce India',
    office_address: '123 MG Road, New Delhi',
    phone: '+91-11-2000-0000',
    email: 'contact@secureforce.com',
    website: 'https://secureforce.com',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=SF',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ID Card Templates</h1>
              <p className="text-gray-600">Browse and manage card design templates</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Available Templates</CardTitle>
                <CardDescription>Total: {CARD_TEMPLATES.length} templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                {CARD_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-900 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{template.name}</p>
                        <Badge className={`mt-1 text-xs ${getCategoryColor(template.category)}`}>
                          {template.category}
                        </Badge>
                      </div>
                      {defaultTemplate === template.id && (
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{template.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {template.width}" × {template.height}"
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Preview and Actions */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTemplate && (
              <>
                {/* Template Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedTemplate.name}</CardTitle>
                    <CardDescription>{selectedTemplate.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <Badge className={getCategoryColor(selectedTemplate.category)}>
                          {selectedTemplate.category}
                        </Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dimensions
                        </label>
                        <p className="text-sm text-gray-600">
                          {selectedTemplate.width}" × {selectedTemplate.height}"
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template Elements
                      </label>
                      <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                        {selectedTemplate.elements.map((el) => (
                          <p key={el.id} className="text-gray-600">
                            • <span className="font-semibold capitalize">{el.type}</span>: {el.id}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {defaultTemplate !== selectedTemplate.id && (
                        <Button
                          onClick={() => handleSetDefault(selectedTemplate.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Set as Default
                        </Button>
                      )}
                      {defaultTemplate === selectedTemplate.id && (
                        <div className="flex-1 flex items-center justify-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Default Template</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        About this template
                      </label>
                      <p className="text-sm text-gray-600">
                        This template features {selectedTemplate.elements.length} design elements and supports
                        automatic data population from employee records.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>Sample card with demo data</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center bg-gray-50 p-6 rounded-b-lg overflow-auto">
                    <div className="transform scale-75 origin-top-left">
                      <IdCard
                        template={selectedTemplate}
                        employee={sampleEmployee}
                        companySettings={sampleSettings}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Usage Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Using Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Default Template</h4>
                <p className="text-sm text-gray-600">
                  The default template will be used for all new employees. You can override it per employee if needed.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Card Generation</h4>
                <p className="text-sm text-gray-600">
                  Templates automatically populate with employee data including name, ID, designation, location, and
                  a QR code linking to their verification page.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Print Ready</h4>
                <p className="text-sm text-gray-600">
                  All templates are optimized for credit card size (3.375" × 2.125") and can be printed at high
                  quality.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Flexible Design</h4>
                <p className="text-sm text-gray-600">
                  Choose from 10+ professional designs covering modern, corporate, premium, security, and specialized
                  use cases.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
