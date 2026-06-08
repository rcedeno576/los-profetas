import webpush from 'web-push'
import { createClient } from '@/app/lib/supabase/server'

webpush.setVapidDetails(
  'mailto:tu@email.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

type SendPushParams = {
  userId: string
  payload: {
    title: string
    body: string
    url?: string
    type?: string
  }
}

export async function sendPushToUser({ userId, payload }: SendPushParams) {
  const supabase = await createClient()

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (error || !subscriptions?.length) return

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(payload)
        )
      } catch (err: any) {
        // 🔥 Limpieza automática si falla (muy importante)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
        }
      }
    })
  )
}