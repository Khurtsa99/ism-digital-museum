import { createClient } from '@supabase/supabase-js'

// Зөвхөн anon (public) түлхүүр ашиглана. service_role түлхүүрийг frontend-д хэзээ ч бүү тавь.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Зургийг Supabase Storage-д хуулж, нийтийн URL буцаана
export async function uploadImage(file, folder = 'misc') {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('images').upload(path, file)
  if (error) throw error
  return supabase.storage.from('images').getPublicUrl(path).data.publicUrl
}
