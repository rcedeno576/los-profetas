import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

type PushSubscriptionBody = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    )
  }

  const body = (await request.json()) as PushSubscriptionBody

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json(
      { error: 'Suscripción inválida' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
      },
      {
        onConflict: 'endpoint',
      }
    )

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    )
  }

  const body = (await request.json()) as { endpoint?: string }

  if (!body.endpoint) {
    return NextResponse.json(
      { error: 'Endpoint requerido' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', body.endpoint)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}