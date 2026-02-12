import { supabase } from './supabase'

/**
 * Generate next employee ID in format SF-XXXX
 * @returns Promise<string> Next employee ID
 */
export async function generateEmployeeId(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('employee_id')
      .order('employee_id', { ascending: false })
      .limit(1)

    if (error) throw error

    let nextNumber = 1
    if (data && data.length > 0) {
      const lastId = data[0].employee_id
      const match = lastId.match(/SF-(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }

    return `SF-${String(nextNumber).padStart(4, '0')}`
  } catch (error) {
    console.error('Error generating employee ID:', error)
    throw error
  }
}

/**
 * Upload photo to Supabase Storage
 * @param file File object
 * @param employeeId Employee ID
 * @returns Promise<string> Public URL of uploaded photo
 */
export async function uploadEmployeePhoto(
  file: File,
  employeeId: string
): Promise<string> {
  try {
    // Validate file
    if (!file) throw new Error('No file selected')
    if (file.size > 5 * 1024 * 1024) throw new Error('File size must be less than 5MB')
    if (!file.type.startsWith('image/')) throw new Error('File must be an image')

    // Upload to Supabase Storage
    const fileName = `${employeeId}-${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage
      .from('employee-photos')
      .upload(`photos/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('employee-photos')
      .getPublicUrl(`photos/${fileName}`)

    return publicUrl
  } catch (error) {
    console.error('Error uploading photo:', error)
    throw error
  }
}

/**
 * Delete photo from Supabase Storage
 * @param photoUrl Public URL of the photo
 */
export async function deleteEmployeePhoto(photoUrl: string): Promise<void> {
  try {
    // Extract file path from public URL
    const urlParts = photoUrl.split('/photos/')
    if (urlParts.length < 2) return

    const filePath = `photos/${urlParts[1].split('?')[0]}`

    const { error } = await supabase.storage
      .from('employee-photos')
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting photo:', error)
    // Don't throw, as this is non-critical
  }
}
