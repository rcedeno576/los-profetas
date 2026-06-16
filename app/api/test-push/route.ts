import { NextRequest, NextResponse } from 'next/server'
import { sendPushToUser } from '@/app/lib/push/server'
import { PUSH_NOTIFICATION_TYPES } from '@/app/lib/constants'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = '08af52a0-5e20-4b25-9d8d-465959f2464c'

  try {
    await sendPushToUser({
      userId,
      payload: {
        title: '🏆 ¡Ya están los puntos!',
        body:  'España 3 - 0 Cape Verde · Revisa cuánto ganaste',
        url:   '/',
        type:  PUSH_NOTIFICATION_TYPES.SCORE_CALCULATED,
      },
    })

    return NextResponse.json({ ok: true, userId })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}