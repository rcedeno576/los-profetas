import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/app/lib/queries/profiles";
import { getMyPools } from "@/app/lib/queries/pools";
import {
  getAvatar,
  POOL_STATUS_LABEL,
  POOL_STATUS_COLOR,
} from "@/app/lib/constants";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Avatar from "@/app/components/ui/Avatar";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, memberships] = await Promise.all([
    getProfile(user.id),
    getMyPools(user.id),
  ]);

  const avatar = getAvatar(profile?.avatar_id ?? "avatar_1");

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-white/50 text-sm">Bienvenido,</p>
            <h1 className="text-white text-2xl font-bold">
              {profile?.username}
            </h1>
            <p className="text-violet-400 text-sm font-medium mt-0.5">
              {profile?.total_pts ?? 0} pts totales
            </p>
          </div>
          <Link href="/perfil" className="hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-2xl">
              <Avatar avatar={avatar} size="lg" />
            </div>
          </Link>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🔮 Mis Liguillas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {memberships.length === 0
              ? "Aún no estás en ninguna liguilla"
              : `Participas en ${memberships.length} liguilla${memberships.length > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Acciones */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/liga/nueva">
            <Button fullWidth variant="primary">
              + Crear liguilla
            </Button>
          </Link>
          <Link href="/liga/unirse">
            <Button fullWidth variant="secondary">
              Unirse con código
            </Button>
          </Link>
        </div>

        {/* Lista de liguillas */}
        {memberships.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-5xl mb-4">🏟️</div>
            <p className="text-white font-bold mb-2">Sin liguillas aún</p>
            <p className="text-gray-500 text-sm">
              Crea una liguilla o únete con un código de invitación
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {memberships.map(({ pool, total_pts }) => (
              <Link key={pool.id} href={`/liga/${pool.id}`}>
                <Card className="hover:border-gray-600 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-white font-bold truncate">
                          {pool.name}
                        </h2>
                        {pool.owner_id === user.id && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mb-2">
                        {(pool.league as any)?.name ?? "—"}
                      </p>
                      <span
                        className={`text-xs font-medium ${POOL_STATUS_COLOR[pool.status]}`}
                      >
                        ● {POOL_STATUS_LABEL[pool.status]}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-bold">{total_pts}</p>
                      <p className="text-gray-500 text-xs">pts</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
