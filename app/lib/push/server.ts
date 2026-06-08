import webpush from "web-push";
import { createServiceClient } from "@/app/lib/supabase/service";

webpush.setVapidDetails(
  "mailto:ricardocedenopaez@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

type SendPushParams = {
  userId: string;
  payload: {
    title: string;
    body: string;
    url?: string;
    type?: string;
  };
};

export async function sendPushToUser({ userId, payload }: SendPushParams) {
  // Service client is required here — this function runs from authenticated
  // API routes (Bearer token), not from a user session. Using the regular
  // client would return empty results due to RLS without an active session.
  const supabase = createServiceClient();

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to fetch push subscriptions: ${error.message}`);
  }

  if (!subscriptions?.length) return;

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
          JSON.stringify(payload),
        );
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription is no longer valid — clean it up.
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
          return;
        }

        // Re-throw any other error so the caller (route.ts) can catch it,
        // increment the failed counter, and roll back the notification log.
        throw err;
      }
    }),
  );
}