import BackButton from '@/app/components/ui/BackButton'
import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAvatar } from '@/app/lib/constants'
import { logout } from '@/app/(auth)/actions'
import Button from '@/app/components/ui/Button'
import EditProfileForm from './EditProfileForm'
import Avatar from '@/app/components/ui/Avatar'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_id, total_pts, created_at')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <BackButton fallback="/dashboard" />
          <h1 className="text-white font-bold">Mi Perfil</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Avatar actual y stats */}
        <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <span className="text-5xl"><Avatar avatar={getAvatar(profile.avatar_id)} size='xl' /></span>
          <div>
            <p className="text-white font-bold text-lg">{profile.username}</p>
            <p className="text-gray-500 text-sm">{profile.total_pts} pts totales</p>
            <p className="text-gray-600 text-xs mt-1">
              Profeta desde {new Date(profile.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Formulario de edición */}
        <EditProfileForm
          currentUsername={profile.username}
          currentAvatarId={profile.avatar_id}
        />

        {/* Cerrar sesión */}
        <form action={logout}>
          <Button type="submit" variant="danger" fullWidth>
            Cerrar sesión
          </Button>
        </form>

      </div>
    </div>
  )
}