import { createClient } from "@/app/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getPoolById } from "@/app/lib/queries/pools";
import { getFixtureDetail } from "@/app/lib/queries/predictions";
import { getAvatar, STATUS_BG, DURATION_LABEL } from "@/app/lib/constants";
import { formatDate, formatTimeOnly } from "@/app/lib/dates";
import BackButton from "@/app/components/ui/BackButton";
import Image from "next/image";
import Avatar from "@/app/components/ui/Avatar";
import { createServiceClient } from "@/app/lib/supabase/service";

type Props = { params: Promise<{ id: string; fixtureId: string }> };

export default async function FixtureDetailPage({ params }: Props) {
  const { id: poolId, fixtureId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const pool = await getPoolById(poolId);
  if (!pool) notFound();

  // Traer el fixture
  const serviceClient = createServiceClient();
  const { data: fixture } = await serviceClient
    .from("fixtures")
    .select("*")
    .eq("id", fixtureId)
    .single();

  if (!fixture) notFound();

  const isFinished = fixture.status === "finished";

  // Traer predicciones de todos los miembros
  let predictions = await getFixtureDetail(fixtureId, poolId);

  // Ordenar según estado del partido
  if (isFinished) {
    predictions.sort((a, b) => (b.points_won ?? -1) - (a.points_won ?? -1));
  } else {
    predictions.sort((a, b) => b.pool_pts - a.pool_pts);
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-4 sticky top-0 bg-gray-950/95 backdrop-blur z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <BackButton fallback={`/liga/${poolId}/partidos`} />
          <div>
            <h1 className="text-white font-bold text-sm">{pool.name}</h1>
            <p className="text-gray-500 text-xs">Detalle del partido</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Partido */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            {/* Local */}
            <div className="flex-1 flex flex-col items-center gap-2">
              {fixture.home_crest && (
                <Image
                  src={fixture.home_crest}
                  alt={fixture.home_name}
                  width={52}
                  height={52}
                  className="object-contain"
                />
              )}
              <p className="text-white text-xs font-medium text-center leading-tight">
                {fixture.home_name}
              </p>
            </div>

            {/* Marcador */}
            <div className="flex flex-col items-center gap-2 shrink-0 w-28">
              {isFinished || fixture.status === "live" ? (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-3xl font-bold tabular-nums ${fixture.status === "live" ? "text-emerald-400" : "text-white"}`}
                  >
                    {fixture.real_home ?? "—"}
                  </span>
                  <span className="text-gray-600 text-xl">:</span>
                  <span
                    className={`text-3xl font-bold tabular-nums ${fixture.status === "live" ? "text-emerald-400" : "text-white"}`}
                  >
                    {fixture.real_away ?? "—"}
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-white font-bold">
                    {formatTimeOnly(fixture.kickoff_at)}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatDate(fixture.kickoff_at)}
                  </p>
                </div>
              )}
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_BG[fixture.status]}`}
              >
                {fixture.status === "live"
                  ? "● En vivo"
                  : isFinished
                    ? fixture.duration && fixture.duration !== "REGULAR"
                      ? DURATION_LABEL[fixture.duration]
                      : "Final"
                    : ""}
              </span>
            </div>

            {/* Visitante */}
            <div className="flex-1 flex flex-col items-center gap-2">
              {fixture.away_crest && (
                <Image
                  src={fixture.away_crest}
                  alt={fixture.away_name}
                  width={52}
                  height={52}
                  className="object-contain"
                />
              )}
              <p className="text-white text-xs font-medium text-center leading-tight">
                {fixture.away_name}
              </p>
            </div>
          </div>
        </div>

        {/* Predicciones del grupo */}
        <div>
          <h2 className="text-white font-bold mb-3">
            {isFinished
              ? "🏆 Resultados del grupo"
              : "🔮 Predicciones del grupo"}
          </h2>
          <div className="space-y-2">
            {predictions.map((p, i) => {
              const avatar = getAvatar(p.avatar_id);
              const isCurrentUser = p.user_id === user.id;
              const hasPred = p.pred_home !== null && p.pred_away !== null;

              return (
                <div
                  key={p.user_id}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
                    isCurrentUser
                      ? "bg-violet-950/40 border-violet-700/40"
                      : "bg-gray-900 border-gray-800"
                  }`}
                >
                  {/* Posición */}
                  <span className="text-gray-500 text-xs w-4 text-center">
                    {i + 1}
                  </span>

                  {/* Avatar */}
                  <span className="text-xl"><Avatar avatar={avatar} size="lg" /></span>

                  {/* Nombre */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {p.username}
                      {isCurrentUser && (
                        <span className="text-violet-400 text-xs ml-1">
                          (tú)
                        </span>
                      )}
                    </p>
                    {!isFinished && (
                      <p className="text-gray-500 text-xs">
                        {p.pool_pts} pts campeonato
                      </p>
                    )}
                  </div>

                  {/* Predicción o puntos */}
                  <div className="text-right shrink-0">
                    {hasPred ? (
                      <>
                        <p className="text-violet-400 text-sm font-bold">
                          {p.pred_home} — {p.pred_away}
                        </p>
                        {isFinished && (
                          <p
                            className={`text-xs font-bold ${
                              p.points_won && p.points_won > 0
                                ? "text-emerald-400"
                                : "text-gray-500"
                            }`}
                          >
                            {p.points_won !== null
                              ? `+${p.points_won} pts`
                              : "Sin puntuar"}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-600 text-xs">Sin predicción</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
