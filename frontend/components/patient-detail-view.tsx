'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Brain, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Patient } from '@/lib/data'
import { hastaAnalizleri } from '@/lib/api'

export function PatientDetailView({
  patient,
  onBack,
}: {
  patient: Patient | null
  onBack: () => void
}) {
  const [analizler, setAnalizler] = useState<any[]>([])
  const [seciliAnaliz, setSeciliAnaliz] = useState<any | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    if (!patient) return
    hastaAnalizleri(patient.id).then(data => {
      setAnalizler(data)
      setYukleniyor(false)
    })
  }, [patient])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary/60"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{patient?.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{patient?.diagnosis}</p>
        </div>
      </div>

      {seciliAnaliz ? (
        <div className="space-y-4">
          <button
            onClick={() => setSeciliAnaliz(null)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="size-4" /> Geri
          </button>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                <h3 className="text-sm font-semibold">Transkript</h3>
              </div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {seciliAnaliz.transkript}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Brain className="size-5 text-primary" />
                <h3 className="text-sm font-semibold">BDT Analizi</h3>
              </div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {seciliAnaliz.analiz_metni}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Seans Geçmişi</h2>
          {yukleniyor ? (
            <p className="text-sm text-muted-foreground">Yükleniyor...</p>
          ) : analizler.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Henüz seans analizi yok.
            </div>
          ) : (
            <div className="space-y-3">
              {analizler.map((a: any, i: number) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-border bg-card p-5 cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => setSeciliAnaliz(a)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Seans {analizler.length - i}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(a.tarih).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-primary">Görüntüle →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}