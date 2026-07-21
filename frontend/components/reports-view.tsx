'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { getHastalar, hastaAnalizleri } from '@/lib/api'
import { FormulationDetail } from '@/components/formulation-detail'

const durumStil: Record<string, { icon: typeof CheckCircle2; renk: string; etiket: string }> = {
  onaylandı: { icon: CheckCircle2, renk: 'text-success', etiket: 'Onaylandı' },
  beklemede: { icon: Clock, renk: 'text-warning', etiket: 'Beklemede' },
  reddedildi: { icon: XCircle, renk: 'text-destructive', etiket: 'Reddedildi' },
}

export function ReportsView() {
  const [hastalar, setHastalar] = useState<any[]>([])
  const [seciliHasta, setSeciliHasta] = useState<any | null>(null)
  const [analizler, setAnalizler] = useState<any[]>([])
  const [seciliAnaliz, setSeciliAnaliz] = useState<any | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    getHastalar().then(data => {
      setHastalar(data)
      setYukleniyor(false)
    })
  }, [])

  const hastaSec = (hasta: any) => {
    setSeciliHasta(hasta)
    setSeciliAnaliz(null)
    hastaAnalizleri(hasta.id).then(data => setAnalizler(data))
  }

  // Seviye 3: seçili seansın tam detayı
  if (seciliAnaliz) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSeciliAnaliz(null)}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Seans listesine dön
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {seciliHasta?.name} · Seans {seciliAnaliz.seans_no}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(seciliAnaliz.tarih).toLocaleDateString('tr-TR')} · {durumStil[seciliAnaliz.durum]?.etiket}
          </p>
        </div>
        <FormulationDetail formulasyon={seciliAnaliz.analiz} />
      </div>
    )
  }

  // Seviye 2: seçili hastanın seans listesi
  if (seciliHasta) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSeciliHasta(null)}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Hasta listesine dön
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{seciliHasta.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{seciliHasta.diagnosis}</p>
        </div>

        {analizler.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Bu hastaya ait henüz bir seans raporu yok.
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {analizler.map((a: any) => {
              const stil = durumStil[a.durum] || durumStil.beklemede
              const Icon = stil.icon
              return (
                <li
                  key={a.id}
                  onClick={() => setSeciliAnaliz(a)}
                  className="flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors hover:bg-secondary/40"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/15">
                    <FileText className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">Seans {a.seans_no}</p>
                    <p className="truncate text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(a.tarih).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${stil.renk}`}>
                    <Icon className="size-3.5" />
                    {stil.etiket}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }

  // Seviye 1: hasta listesi
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Raporlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bir hasta seçerek geçmiş seans raporlarını görüntüleyin.
        </p>
      </div>

      {yukleniyor ? (
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hastalar.map((hasta) => (
            <div
              key={hasta.id}
              onClick={() => hastaSec(hasta)}
              className="cursor-pointer rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-base font-semibold text-primary">
                  {hasta.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{hasta.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{hasta.diagnosis}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}