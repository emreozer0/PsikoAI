'use client'

import { useState, useEffect } from 'react'
import { FileText, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Patient } from '@/lib/data'
import { formulasyonOlustur, analizOnayla } from '@/lib/api'
import { FormulationDetail } from '@/components/formulation-detail'

export function AnalysisView({
  patient,
  transkript,
  onSave,
}: {
  patient: Patient | null
  transkript: string
  onSave: () => void
}) {
  const [formulasyon, setFormulasyon] = useState<any>(null)
  const [analizId, setAnalizId] = useState<number | null>(null)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [hataMesaji, setHataMesaji] = useState('')

  useEffect(() => {
    if (!transkript || !patient) return
    setYukleniyor(true)
    setHataMesaji('')
    formulasyonOlustur(patient.id, transkript)
      .then(data => {
        if (data.detail) {
          setHataMesaji(data.detail)
        } else {
          setFormulasyon(data.analiz)
          setAnalizId(data.id)
        }
        setYukleniyor(false)
      })
      .catch(() => {
        setHataMesaji('Analiz sırasında bir hata oluştu.')
        setYukleniyor(false)
      })
  }, [transkript, patient])

  const handleOnayla = async () => {
    if (!analizId) return
    setKaydediliyor(true)
    await analizOnayla(analizId)
    setKaydediliyor(false)
    onSave()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analiz</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {patient ? patient.name : 'Danışan'} · Yapay zeka destekli BDT değerlendirmesi
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="size-[18px] text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Transkript</h3>
        </div>
        <div className="max-h-[40vh] overflow-y-auto pr-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {transkript || 'Transkript bulunamadı.'}
        </div>
      </div>

      {yukleniyor && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-2xl border border-border bg-card p-5">
          <Loader2 className="size-4 animate-spin" />
          BDT formülasyonu oluşturuluyor...
        </div>
      )}

      {hataMesaji && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          {hataMesaji}
        </div>
      )}

      <FormulationDetail formulasyon={formulasyon} />

      <div className="flex justify-end gap-2">
        <Button
          onClick={handleOnayla}
          disabled={kaydediliyor || yukleniyor || !formulasyon}
          className="gap-2 shadow-[0_0_20px_-6px_var(--color-primary)]"
        >
          {kaydediliyor ? (
            <><Loader2 className="size-4 animate-spin" />Kaydediliyor...</>
          ) : (
            <><Check className="size-4" />Onayla ve Kaydet</>
          )}
        </Button>
      </div>
    </div>
  )
}