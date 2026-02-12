'use client'

import React, { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { CardTemplate, CardElement } from '@/lib/card-templates'
import { Employee } from '@/lib/validators'

// Dynamically import QRCode to avoid SSR issues
const QRCode = dynamic(() => import('qrcode.react'), { ssr: false })

interface IdCardProps {
  template: CardTemplate
  employee: Employee & { department?: any; designation?: any; location?: any }
  companySettings?: any
  printMode?: boolean
}

export const IdCard: React.FC<IdCardProps> = ({
  template,
  employee,
  companySettings,
  printMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Convert inches to pixels (96 DPI for web, 300 DPI for print)
  const DPI = printMode ? 300 : 96
  const INCH_TO_PX = DPI

  // Calculate dimensions
  const cardWidth = template.width * INCH_TO_PX
  const cardHeight = template.height * INCH_TO_PX

  // Variable substitution
  const getSubstitutedText = (text: string | undefined): string => {
    if (!text) return ''

    let result = text
    result = result.replace('{{company_name}}', companySettings?.company_name || 'Company Name')
    result = result.replace('{{employee_name}}', employee.name || '')
    result = result.replace('{{employee_id}}', employee.employee_id || '')
    result = result.replace('{{employee_phone}}', employee.phone || '')
    result = result.replace('{{designation_name}}', employee.designation?.name || '')
    result = result.replace('{{department_name}}', employee.department?.name || '')
    result = result.replace('{{location_name}}', employee.location?.name || '')

    // Format dates
    if (employee.id_card_valid_from) {
      const date = new Date(employee.id_card_valid_from)
      result = result.replace('{{id_valid_from_short}}', date.toLocaleDateString('en-IN'))
    }
    if (employee.id_card_valid_until) {
      const date = new Date(employee.id_card_valid_until)
      result = result.replace('{{id_valid_until_short}}', date.toLocaleDateString('en-IN'))
    }

    return result
  }

  const getVerificationUrl = (): string => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/verify/${employee.employee_id}`
  }

  // Render element based on type
  const renderElement = (
    ctx: CanvasRenderingContext2D,
    element: CardElement
  ) => {
    const x = element.x * INCH_TO_PX
    const y = element.y * INCH_TO_PX
    const width = element.width ? element.width * INCH_TO_PX : undefined
    const height = element.height ? element.height * INCH_TO_PX : undefined

    switch (element.type) {
      case 'rectangle':
        if (element.backgroundColor) {
          ctx.fillStyle = element.backgroundColor
          ctx.globalAlpha = element.opacity ?? 1
          ctx.fillRect(x, y, width || 0, height || 0)
          ctx.globalAlpha = 1
        }
        if (element.borderColor && element.borderWidth) {
          ctx.strokeStyle = element.borderColor
          ctx.lineWidth = element.borderWidth
          ctx.strokeRect(x, y, width || 0, height || 0)
        }
        break

      case 'circle':
        ctx.fillStyle = element.backgroundColor || '#000000'
        ctx.beginPath()
        ctx.arc(x + (element.radius || 0), y + (element.radius || 0), element.radius || 0, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'line':
        ctx.strokeStyle = element.borderColor || '#000000'
        ctx.lineWidth = element.borderWidth || 1
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + (width || 0), y)
        ctx.stroke()
        break

      case 'text':
        ctx.fillStyle = element.color || '#000000'
        ctx.font = `${element.fontWeight === 'bold' ? 'bold ' : ''}${element.fontSize || 12}px Arial, sans-serif`
        ctx.textAlign = element.align === 'center' ? 'center' : element.align === 'right' ? 'right' : 'left'
        ctx.textBaseline = 'top'

        const textX = element.align === 'center' ? x + (width || 0) / 2 : element.align === 'right' ? x + (width || 0) : x
        const substitutedText = getSubstitutedText(element.text)

        // Word wrap if needed
        if (width) {
          const words = substitutedText.split(' ')
          let line = ''
          let lineY = y

          words.forEach((word) => {
            const testLine = line + (line ? ' ' : '') + word
            const metrics = ctx.measureText(testLine)
            if (metrics.width > width && line) {
              ctx.fillText(line, textX, lineY)
              line = word
              lineY += (element.fontSize || 12) * 1.2
            } else {
              line = testLine
            }
          })
          if (line) ctx.fillText(line, textX, lineY)
        } else {
          ctx.fillText(substitutedText, textX, y)
        }
        break

      case 'image':
        // Images will be handled separately with onload
        break

      case 'qrcode':
        // QR codes will be rendered as SVG and converted to image
        break
    }
  }

  // Draw card
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = cardWidth
    canvas.height = cardHeight

    // Draw background
    ctx.fillStyle = template.backgroundColor
    ctx.fillRect(0, 0, cardWidth, cardHeight)

    // Render all elements
    template.elements.forEach((element) => {
      if (element.type === 'image') {
        // Handle images
        const imageUrl = element.source?.replace('{{logo_url}}', companySettings?.logo_url || '').replace('{{employee_photo}}', employee.photo_url || '') || ''
        if (imageUrl && imageUrl !== '{{' && imageUrl !== '}}') {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            const x = element.x * INCH_TO_PX
            const y = element.y * INCH_TO_PX
            const width = element.width ? element.width * INCH_TO_PX : img.width
            const height = element.height ? element.height * INCH_TO_PX : img.height

            // Draw border if specified
            if (element.borderColor && element.borderWidth) {
              ctx.strokeStyle = element.borderColor
              ctx.lineWidth = element.borderWidth
              ctx.strokeRect(x, y, width, height)
            }

            // Draw image
            ctx.drawImage(img, x, y, width, height)
          }
          img.src = imageUrl
        }
      } else if (element.type === 'qrcode') {
        // QR codes are rendered later as SVG
      } else {
        renderElement(ctx, element)
      }
    })
  }, [template, employee, companySettings, cardWidth, cardHeight])

  // HTML render (for screen display with actual QR codes and images)
  const getElementStyle = (element: CardElement): React.CSSProperties => {
    return {
      position: 'absolute',
      left: `${(element.x / template.width) * 100}%`,
      top: `${(element.y / template.height) * 100}%`,
      width: element.width ? `${(element.width / template.width) * 100}%` : 'auto',
      height: element.height ? `${(element.height / template.height) * 100}%` : 'auto',
      backgroundColor: element.backgroundColor,
      color: element.color,
      fontSize: element.fontSize ? `${(element.fontSize / 12) * 1}rem` : '0.75rem',
      fontWeight: element.fontWeight === 'bold' ? 'bold' : 'normal',
      textAlign: element.align as any || 'left',
      borderColor: element.borderColor,
      borderWidth: element.borderWidth ? `${element.borderWidth}px` : undefined,
      borderStyle: element.borderColor ? 'solid' : undefined,
      display: 'flex',
      alignItems: 'center',
      justifyContent: element.align === 'center' ? 'center' : element.align === 'right' ? 'flex-end' : 'flex-start',
      padding: '0.125rem',
      overflow: 'hidden',
    }
  }

  return (
    <>
      {/* HTML Canvas for print */}
      <canvas
        ref={canvasRef}
        className={printMode ? 'visible' : 'hidden'}
        style={{
          width: `${template.width * 96}px`,
          height: `${template.height * 96}px`,
          pageBreakAfter: 'always',
        }}
      />

      {/* HTML Display for screen */}
      {!printMode && (
        <div
          className="relative bg-white shadow-lg overflow-hidden"
          style={{
            width: `${template.width * 96}px`,
            height: `${template.height * 96}px`,
            aspectRatio: `${template.width} / ${template.height}`,
            backgroundColor: template.backgroundColor,
          }}
        >
          {/* Render all elements */}
          {template.elements.map((element) => {
            switch (element.type) {
              case 'rectangle':
              case 'circle':
              case 'line':
                return (
                  <div
                    key={element.id}
                    style={getElementStyle(element)}
                    className={element.type === 'circle' ? 'rounded-full' : ''}
                  />
                )

              case 'text':
                return (
                  <div
                    key={element.id}
                    style={getElementStyle(element)}
                    className="whitespace-normal break-words"
                  >
                    {getSubstitutedText(element.text)}
                  </div>
                )

              case 'image':
                const imageUrl = element.source
                  ?.replace('{{logo_url}}', companySettings?.logo_url || '')
                  .replace('{{employee_photo}}', employee.photo_url || '') || ''

                return imageUrl && imageUrl !== '{{' && imageUrl !== '}}' ? (
                  <img
                    key={element.id}
                    src={imageUrl}
                    alt={element.id}
                    style={{
                      ...getElementStyle(element),
                      objectFit: 'cover',
                    }}
                  />
                ) : null

              case 'qrcode':
                const qrUrl = getVerificationUrl()
                return (
                  <div
                    key={element.id}
                    style={getElementStyle(element)}
                    className="flex items-center justify-center"
                  >
                    <QRCode
                      value={qrUrl}
                      size={Math.min(element.width || 0.5, element.height || 0.5) * 96}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                )

              default:
                return null
            }
          })}
        </div>
      )}
    </>
  )
}

export default IdCard
