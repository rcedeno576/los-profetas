import { createServiceClient } from '@/app/lib/supabase/service'

export type CronProcess =
  | 'cron'
  | 'sync'
  | 'score'
  | 'notify_scored'
  | 'notify_upcoming'

export type CronStatus = 'success' | 'error' | 'skipped'

type Payload = Record<string, unknown>
type Result  = Record<string, unknown>

// Runner devuelto por start() — cierra el log con el resultado final
type CronLogRunner = {
  success: (result?: Result)  => Promise<void>
  error:   (err: unknown)     => Promise<void>
  skip:    (reason: string)   => Promise<void>
}

async function writeLog(entry: {
  process:     CronProcess
  status:      CronStatus
  payload?:    Payload
  result?:     Result
  error?:      string
  duration_ms: number
}): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('cron_logs')
    .insert(entry)

  // Si el log falla, solo imprimimos — nunca rompemos el proceso principal
  if (error) {
    console.error('[cron-logger] Failed to write log:', error.message, entry)
  }
}

// Inicia un proceso y devuelve un runner para cerrarlo
export function startLog(process: CronProcess, payload?: Payload): CronLogRunner {
  const startedAt = Date.now()

  return {
    async success(result?: Result) {
      await writeLog({
        process,
        status:      'success',
        payload,
        result,
        duration_ms: Date.now() - startedAt,
      })
    },

    async error(err: unknown) {
      const message =
        err instanceof Error ? err.message : String(err)

      await writeLog({
        process,
        status:      'error',
        payload,
        error:       message,
        duration_ms: Date.now() - startedAt,
      })
    },

    async skip(reason: string) {
      await writeLog({
        process,
        status:      'skipped',
        payload,
        result:      { reason },
        duration_ms: Date.now() - startedAt,
      })
    },
  }
}
