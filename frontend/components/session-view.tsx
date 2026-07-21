'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Circle,
  Square,
  Mic,
  MicOff,
  Loader2,
  FileAudio,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Patient } from '@/lib/data'
import { transkribeEt } from '@/lib/api'

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

export function SessionView({
  patient,
  onTranscribe,
}: {
  patient: Patient | null
  onTranscribe: (transkript: string) => void
}) {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [muted, setMuted] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [dosya, setDosya] = useState<File | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (recording) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [recording])

  const baslatKayit = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    audioChunksRef.current = []

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
      const audioFile = new File([audioBlob], 'seans.wav', { type: 'audio/wav' })
      setDosya(audioFile)
    }

    mediaRecorder.start()
    setRecording(true)
  }

  const durdurKayit = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  const handleTranscribe = async () => {
    if (!dosya) return
    setTranscribing(true)
    const sonuc = await transkribeEt(dosya)
    setTranscribing(false)
    onTranscribe(sonuc.transkript)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Seans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {patient ? patient.name : 'Danışan'} ile canlı görüşme
        </p>
      </div>

      {/* Video area */}
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-secondary/40">
        <iframe
          src={`https://meet.jit.si/${patient?.id}-psiko-seans`}
          className="absolute inset-0 h-full w-full"
          allow="camera; microphone; fullscreen"
        />

        {recording && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-destructive/20 px-3 py-1.5 text-xs font-medium text-destructive">
            <span className="size-2 animate-pulse rounded-full bg-destructive" />
            Kayıt
          </div>
        )}

        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-border bg-card/80 px-4 py-1.5 font-mono text-sm tabular-nums backdrop-blur">
          {formatTime(elapsed)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant={recording ? 'destructive' : 'default'}
          onClick={recording ? durdurKayit : baslatKayit}
          disabled={transcribing}
          className={cn(
            'gap-2',
            !recording && 'shadow-[0_0_20px_-6px_var(--color-primary)]',
          )}
        >
          {recording ? (
            <><Square className="size-4" />Kaydı Durdur</>
          ) : (
            <><Circle className="size-4" />Kaydı Başlat</>
          )}
        </Button>

        <Button
          variant="secondary"
          onClick={() => setMuted((m) => !m)}
          className="gap-2"
        >
          {muted ? (
            <><MicOff className="size-4" /> Sesi Aç</>
          ) : (
            <><Mic className="size-4" /> Sesi Kapat</>
          )}
        </Button>
      </div>

      {/* End + transcribe */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <FileAudio className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Seansı sonlandır</p>
              <p className="text-xs text-muted-foreground">
                {dosya ? `Kayıt hazır: ${dosya.name}` : 'Kaydı başlatın ve durdurun.'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleTranscribe}
            disabled={transcribing || !dosya}
            className="gap-2 shadow-[0_0_20px_-6px_var(--color-primary)]"
          >
            {transcribing ? (
              <><Loader2 className="size-4 animate-spin" />Transkribe ediliyor...</>
            ) : (
              'Seansı Bitir ve Transkribe Et'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}