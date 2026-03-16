'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { MESSAGES, MAX_POOLS_PER_USER, DEFAULT_RULE_PTS } from '@/app/lib/constants'
import type { ActionResult } from '@/app/lib/types'

// ─── Validadores ──────────────────────────────────────────────

function isValidPoolName(name: string): boolean {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 _-]{3,50}$/.test(name)
}

function sanitize(text: string): string {
  return text.trim().replace(/[<>'"`;]/g, '')
}

// ─── Crear liguilla ───────────────────────────────────────────

export async function createPool(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: MESSAGES.auth.genericError }

  const name        = sanitize(formData.get('name') as string || '')
  const description = sanitize(formData.get('description') as string || '')
  const league_id   = parseInt(formData.get('league_id') as string)

  // Validaciones
  if (!name || !isValidPoolName(name)) return { error: MESSAGES.pool.nameRequired }
  if (!league_id)                      return { error: MESSAGES.pool.leagueRequired }

  // Verificar límite de pools por usuario
  const { count } = await supabase
    .from('pools')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  if ((count ?? 0) >= MAX_POOLS_PER_USER) return { error: MESSAGES.pool.maxReached }

  // Crear pool + reglas de forma atómica
  const { data: poolId, error } = await supabase
    .rpc('create_pool_with_rules', {
      p_name:        name,
      p_description: description || null,
      p_owner_id:    user.id,
      p_league_id:   league_id,
    })

  if (error || !poolId) return { error: MESSAGES.auth.genericError }

  revalidatePath('/dashboard')
  redirect(`/liga/${poolId}`)
}

// ─── Unirse a liguilla por código ─────────────────────────────

export async function joinPool(formData: FormData): Promise<{ error?: string; poolId?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const invite_code = formData.get('invite_code') as string
  if (!invite_code) return { error: 'Código requerido' }

  // Buscar la pool por código
  const { data: pool, error: poolError } = await supabase
    .from('pools')
    .select('id, status, name')
    .eq('invite_code', invite_code)
    .single()

  if (poolError || !pool) return { error: 'Código inválido — verifica e intenta de nuevo' }
  if (pool.status !== 'open') return { error: 'Esta liguilla no está aceptando nuevos miembros' }

  // Verificar si ya es miembro
  const { data: existing } = await supabase
    .from('pool_members')
    .select('user_id, active')
    .eq('pool_id', pool.id)
    .eq('user_id', user.id)
    .single()

  if (existing?.active) return { error: 'Ya eres miembro de esta liguilla' }

  // Si existía inactivo — reactivar
  if (existing && !existing.active) {
    const { error: updateError } = await supabase
      .from('pool_members')
      .update({ active: true, left_at: null })
      .eq('pool_id', pool.id)
      .eq('user_id', user.id)

    if (updateError) return { error: 'No se pudo unir — intenta de nuevo' }
    return { poolId: pool.id }
  }

  // Nuevo miembro
  const { error: insertError } = await supabase
    .from('pool_members')
    .insert({ pool_id: pool.id, user_id: user.id })

  if (insertError) return { error: 'No se pudo unir — intenta de nuevo' }
  return { poolId: pool.id }
}

// ─── Salir de liguilla (soft delete) ─────────────────────────

export async function leavePool(poolId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: MESSAGES.auth.genericError }

  const { error } = await supabase
    .from('pool_members')
    .update({ active: false, left_at: new Date().toISOString() })
    .eq('pool_id', poolId)
    .eq('user_id', user.id)

  if (error) return { error: MESSAGES.auth.genericError }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// ─── Cambiar status de liguilla ───────────────────────────────

export async function updatePoolStatus(
  poolId: string,
  status: 'open' | 'active' | 'finished'
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: MESSAGES.auth.genericError }

  const { error } = await supabase
    .from('pools')
    .update({ status })
    .eq('id', poolId)
    .eq('owner_id', user.id)

  if (error) return { error: MESSAGES.auth.genericError }

  revalidatePath(`/liga/${poolId}`)
  return { success: 'Estado actualizado.' }
}