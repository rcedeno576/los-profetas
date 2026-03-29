'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { MESSAGES } from '@/app/lib/constants'
import type { ActionResult } from '@/app/lib/types'

export async function updateProfile(
  username: string,
  avatarId: string
): Promise<ActionResult> {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: MESSAGES.auth.genericError }

  // Validar username
  const usernameRegex = /^[a-zA-Z0-9\-]{3,30}$/
  if (!username.trim()) return { error: MESSAGES.validation.usernameRequired }
  if (!usernameRegex.test(username)) return { error: MESSAGES.validation.usernameInvalid }

  const { error } = await supabase
    .from('profiles')
    .update({ username, avatar_id: avatarId })
    .eq('id', user.id)

  if (error) return { error: MESSAGES.auth.genericError }

  revalidatePath('/perfil')
  revalidatePath('/dashboard')
  return { success: 'Perfil actualizado correctamente.' }
}