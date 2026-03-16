'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { MESSAGES } from '@/app/lib/constants'
import type { ActionResult } from '@/app/lib/types'

// ─── Validadores ──────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPassword(password: string): boolean {
  return password.length >= 8
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 _-]{3,30}$/.test(username)
}

function sanitize(text: string): string {
  return text.trim().replace(/[<>'"`;]/g, '')
}

// ─── Registro ─────────────────────────────────────────────────

export async function register(formData: FormData): Promise<ActionResult> {
  const username  = sanitize(formData.get('username') as string || '')
  const email     = sanitize(formData.get('email') as string || '')
  const password  = formData.get('password') as string || ''
  const avatar_id = sanitize(formData.get('avatar_id') as string || 'avatar_1')

  if (!username)                  return { error: MESSAGES.validation.usernameRequired }
  if (!isValidUsername(username)) return { error: MESSAGES.validation.usernameInvalid }
  if (!isValidEmail(email))       return { error: MESSAGES.validation.emailInvalid }
  if (!isValidPassword(password)) return { error: MESSAGES.validation.passwordShort }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, avatar_id } }
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: MESSAGES.auth.emailExists }
    }
    return { error: MESSAGES.auth.genericError }
  }

  return { success: MESSAGES.auth.registerSuccess }
}

// ─── Login ────────────────────────────────────────────────────

export async function login(formData: FormData): Promise<ActionResult> {
  const email    = sanitize(formData.get('email') as string || '')
  const password = formData.get('password') as string || ''

  if (!isValidEmail(email)) return { error: MESSAGES.validation.emailInvalid }
  if (!password)            return { error: MESSAGES.validation.passwordRequired }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: MESSAGES.auth.loginError }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ─── Logout ───────────────────────────────────────────────────

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}