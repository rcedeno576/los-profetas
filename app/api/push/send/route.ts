import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { sendPushToUser } from '@/app/lib/push/server'

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  await sendPushToUser({
    userId: user.id,
    payload: {
      title: 'Test push',
      body: 'Esto viene del servidor 🚀',
      url: '/perfil',
    },
  })

  return NextResponse.json({ ok: true })
}