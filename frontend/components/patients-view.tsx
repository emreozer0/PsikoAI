'use client'

import { useState, useEffect } from 'react'
import { Plus, CalendarClock, Layers, Play, Eye, X, Trash2, Pencil, FileText, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Patient } from '@/lib/data'
import { getHastalar, hastaEkle, hastaSil, hastaGuncelle, hastaAnalizleri } from '@/lib/api'

export function PatientsView({
  onStartSession,
  onView,
}: {
  onStartSession: (patient: Patient) => void
  onView: (patient: Patient) => void
}) {
  const [hastalar, setHastalar] = useState<any[]>([])
  const [formAcik, setFormAcik] = useState(false)
  const [ad, setAd] = useState('')
  const [tani, setTani] = useState('')
  const [duzenleHasta, setDuzenleHasta] = useState<any | null>(null)
  const [duzenleAd, setDuzenleAd] = useState('')
  const [duzenleTani, setDuzenleTani] = useState('')

  // Analiz geçmişi paneli
  const [gecmisAcik, setGecmisAcik] = useState(false)
  const [gecmisHasta, setGecmisHasta] = useState<any | null>(null)
  const [gecmisData, setGecmisData] = useState<any[]>([])
  const [gecmisYukleniyor, setGecmisYukleniyor] = useState(false)

  const hastalariYukle = () => {
    getHastalar().then(data => setHastalar(data))
  }

  useEffect(() => {
    hastalariYukle()
  }, [])

  const handleEkle = async () => {
    if (!ad || !tani) return
    await hastaEkle(ad, tani)
    setAd('')
    setTani('')
    setFormAcik(false)
    hastalariYukle()
  }

  const handleSil = async (id: string) => {
    if (!confirm('Bu hastayı silmek istediğinizden emin misiniz?')) return
    await hastaSil(id)
    hastalariYukle()
  }

  const handleDuzenleAc = (patient: any) => {
    setDuzenleHasta(patient)
    setDuzenleAd(patient.name)
    setDuzenleTani(patient.diagnosis)
  }

  const handleDuzenleKaydet = async () => {
    if (!duzenleHasta) return
    await hastaGuncelle(duzenleHasta.id, duzenleAd, duzenleTani)
    setDuzenleHasta(null)
    hastalariYukle()
  }

  const handleGecmisAc = async (patient: any) => {
    setGecmisHasta(patient)
    setGecmisAcik(true)
    setGecmisYukleniyor(true)
    try {
      const data = await hastaAnalizleri(patient.id)
      setGecmisData(Array.isArray(data) ? data : [])
    } catch (e) {
      setGecmisData([])
    } finally {
      setGecmisYukleniyor(false)
    }
  }

  const handleGecmisKapat = () => {
    setGecmisAcik(false)
    setTimeout(() => {
      setGecmisHasta(null)
      setGecmisData([])
    }, 300)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hastalar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aktif danışanlarınızı yönetin ve seans başlatın.
          </p>
        </div>
        <Button
          onClick={() => setFormAcik(true)}
          className="gap-2 shadow-[0_0_20px_-6px_var(--color-primary)]"
        >
          <Plus className="size-4" />
          Yeni Hasta Ekle
        </Button>
      </div>

      {/* Yeni Hasta Formu */}
      {formAcik && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Yeni Hasta</h3>
            <button onClick={() => setFormAcik(false)}>
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ad Soyad</label>
              <input
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                placeholder="Örn: Ayşe Yılmaz"
                className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tanı</label>
              <input
                value={tani}
                onChange={(e) => setTani(e.target.value)}
                placeholder="Örn: Sosyal Anksiyete"
                className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setFormAcik(false)}>İptal</Button>
            <Button onClick={handleEkle}>Kaydet</Button>
          </div>
        </div>
      )}

      {/* Düzenleme Formu */}
      {duzenleHasta && (
        <div className="rounded-2xl border border-primary/30 bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Hasta Düzenle</h3>
            <button onClick={() => setDuzenleHasta(null)}>
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ad Soyad</label>
              <input
                value={duzenleAd}
                onChange={(e) => setDuzenleAd(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tanı</label>
              <input
                value={duzenleTani}
                onChange={(e) => setDuzenleTani(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDuzenleHasta(null)}>İptal</Button>
            <Button onClick={handleDuzenleKaydet}>Güncelle</Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {hastalar.map((patient) => (
          <div
            key={patient.id}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-base font-semibold text-primary">
                  {patient.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{patient.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {patient.diagnosis}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleDuzenleAc(patient)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => handleSil(patient.id)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-muted-foreground">
                <CalendarClock className="size-4 text-primary/80" />
                <span className="truncate">{patient.lastSession}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-muted-foreground">
                <Layers className="size-4 text-primary/80" />
                <span>{patient.sessionCount} seans</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => onStartSession(patient)}
                className="flex-1 gap-2"
              >
                <Play className="size-4" />
                Seans Başlat
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleGecmisAc(patient)}
                className="flex-1 gap-2"
              >
                <Eye className="size-4" />
                Görüntüle
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Analiz Geçmişi - Kayan Panel */}
      {gecmisHasta && (
        <>
          <div
            onClick={handleGecmisKapat}
            className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
              gecmisAcik ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div
            className={`fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border bg-background shadow-2xl transition-transform duration-300 ease-out ${
              gecmisAcik ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {gecmisHasta.initials}
                  </div>
                  <div>
                    <p className="font-medium">{gecmisHasta.name}</p>
                    <p className="text-xs text-muted-foreground">{gecmisHasta.diagnosis}</p>
                  </div>
                </div>
                <button
                  onClick={handleGecmisKapat}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Analiz Geçmişi</h3>

                {gecmisYukleniyor && (
                  <p className="text-sm text-muted-foreground">Yükleniyor...</p>
                )}

                {!gecmisYukleniyor && gecmisData.length === 0 && (
                  <p className="text-sm text-muted-foreground">Bu hasta için henüz kayıtlı analiz yok.</p>
                )}

                {!gecmisYukleniyor && gecmisData.map((analiz: any) => (
                  <div
                    key={analiz.id}
                    className="rounded-xl border border-border bg-card p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />
                      <span>
                        {analiz.tarih
                          ? new Date(analiz.tarih).toLocaleString('tr-TR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Tarih bilgisi yok'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 size-4 shrink-0 text-primary/80" />
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {analiz.analiz_metni}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}