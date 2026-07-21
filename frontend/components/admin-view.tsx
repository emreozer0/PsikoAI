'use client'

import { useState, useEffect } from 'react'
import { Trash2, ShieldCheck, Loader2, ArrowRightLeft, X, UserPlus } from 'lucide-react'

const API_URL = "http://localhost:8000"

type Terapist = {
  id: number
  ad: string
  email: string
  is_admin: boolean
}

type HastaKayit = {
  id: number
  ad: string
  tani: string
  terapist_id: number
}

export function AdminView() {
  const [terapistler, setTerapistler] = useState<Terapist[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [silinenId, setSilinenId] = useState<number | null>(null)
  const [hata, setHata] = useState<string | null>(null)

  // Hasta yönetimi paneli (bir terapist silinemediğinde açılır)
  const [yonetimTerapist, setYonetimTerapist] = useState<Terapist | null>(null)
  const [yonetimHastalar, setYonetimHastalar] = useState<HastaKayit[]>([])
  const [yonetimYukleniyor, setYonetimYukleniyor] = useState(false)
  const [islemHastaId, setIslemHastaId] = useState<number | null>(null)

  // Yeni terapist ekleme formu
  const [eklemeAcik, setEklemeAcik] = useState(false)
  const [yeniAd, setYeniAd] = useState('')
  const [yeniEmail, setYeniEmail] = useState('')
  const [yeniSifre, setYeniSifre] = useState('')
  const [yeniIsAdmin, setYeniIsAdmin] = useState(false)
  const [eklemeYukleniyor, setEklemeYukleniyor] = useState(false)
  const [eklemeHata, setEklemeHata] = useState<string | null>(null)

  const listele = () => {
    setYukleniyor(true)
    fetch(`${API_URL}/auth/terapistler`)
      .then(res => res.json())
      .then(data => {
        setTerapistler(data)
        setYukleniyor(false)
      })
  }

  useEffect(() => {
    listele()
  }, [])

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  })

  const handleSil = async (terapist: Terapist) => {
    if (!confirm(`${terapist.ad} (${terapist.email}) adlı terapisti silmek istediğinizden emin misiniz?`)) return

    setSilinenId(terapist.id)
    setHata(null)

    try {
      const res = await fetch(`${API_URL}/auth/terapist/${terapist.id}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
      const data = await res.json()

      if (!res.ok) {
        setHata(data.detail || 'Terapist silinemedi.')
        // Hastası olduğu için silinemediyse, hasta yönetim panelini aç
        if (res.status === 400) {
          handleYonetimAc(terapist)
        }
      } else {
        listele()
      }
    } catch (e) {
      setHata('Bir hata oluştu.')
    } finally {
      setSilinenId(null)
    }
  }

  const handleYonetimAc = async (terapist: Terapist) => {
    setYonetimTerapist(terapist)
    setYonetimYukleniyor(true)
    try {
      const res = await fetch(`${API_URL}/hastalar/admin/terapist/${terapist.id}`, {
        headers: authHeaders()
      })
      const data = await res.json()
      setYonetimHastalar(Array.isArray(data) ? data : [])
    } catch (e) {
      setYonetimHastalar([])
    } finally {
      setYonetimYukleniyor(false)
    }
  }

  const handleYonetimKapat = () => {
    setYonetimTerapist(null)
    setYonetimHastalar([])
  }

  const handleHastaSil = async (hastaId: number) => {
    if (!confirm('Bu hastayı ve tüm verilerini kalıcı olarak silmek istediğinizden emin misiniz?')) return
    setIslemHastaId(hastaId)
    try {
      await fetch(`${API_URL}/hastalar/admin/${hastaId}`, {
        method: 'DELETE',
        headers: authHeaders()
      })
      setYonetimHastalar(prev => prev.filter(h => h.id !== hastaId))
    } finally {
      setIslemHastaId(null)
    }
  }

  const handleHastaAktar = async (hastaId: number, yeniTerapistId: number) => {
    setIslemHastaId(hastaId)
    try {
      await fetch(`${API_URL}/hastalar/admin/${hastaId}/aktar?yeni_terapist_id=${yeniTerapistId}`, {
        method: 'PUT',
        headers: authHeaders()
      })
      setYonetimHastalar(prev => prev.filter(h => h.id !== hastaId))
    } finally {
      setIslemHastaId(null)
    }
  }

  const eklemeFormuTemizle = () => {
    setYeniAd('')
    setYeniEmail('')
    setYeniSifre('')
    setYeniIsAdmin(false)
    setEklemeHata(null)
  }

  const handleEklemeKapat = () => {
    setEklemeAcik(false)
    eklemeFormuTemizle()
  }

  const handeEkle = async (e: React.FormEvent) => {
    e.preventDefault()
    setEklemeHata(null)

    if (!yeniAd.trim() || !yeniEmail.trim() || !yeniSifre) {
      setEklemeHata('Lütfen tüm alanları doldurun.')
      return
    }

    setEklemeYukleniyor(true)
    try {
      const params = new URLSearchParams({
        email: yeniEmail.trim(),
        sifre: yeniSifre,
        ad: yeniAd.trim(),
        is_admin: String(yeniIsAdmin)
      })

      const res = await fetch(`${API_URL}/auth/kayit?${params.toString()}`, {
        method: 'POST',
        headers: authHeaders()
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setEklemeHata(data.detail || 'Terapist eklenemedi.')
        return
      }

      listele()
      handleEklemeKapat()
    } catch (e) {
      setEklemeHata('Bir hata oluştu.')
    } finally {
      setEklemeYukleniyor(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Terapistler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sistemdeki tüm terapist hesaplarını yönetin.
          </p>
        </div>
        <button
          onClick={() => setEklemeAcik(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <UserPlus className="size-4" />
          Yeni Terapist
        </button>
      </div>

      {hata && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {hata}
        </div>
      )}

      {/* Yeni Terapist Ekleme Paneli */}
      {eklemeAcik && (
        <form
          onSubmit={handeEkle}
          className="rounded-2xl border border-primary/30 bg-card p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Yeni Terapist Ekle</h3>
            <button type="button" onClick={handleEklemeKapat}>
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>

          {eklemeHata && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {eklemeHata}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Ad Soyad</label>
              <input
                type="text"
                value={yeniAd}
                onChange={(e) => setYeniAd(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Ör. Ayşe Yılmaz"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                value={yeniEmail}
                onChange={(e) => setYeniEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="ornek@site.com"
                required
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Şifre</label>
              <input
                type="password"
                value={yeniSifre}
                onChange={(e) => setYeniSifre(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="En az 8 karakter, büyük/küçük harf, rakam, özel karakter"
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={yeniIsAdmin}
                onChange={(e) => setYeniIsAdmin(e.target.checked)}
                className="size-4 rounded border-border"
              />
              Admin yetkisi ver
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleEklemeKapat}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/40"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={eklemeYukleniyor}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {eklemeYukleniyor ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              Ekle
            </button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {yukleniyor ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Yükleniyor...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Ad</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {terapistler.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{t.ad}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.email}</td>
                  <td className="px-4 py-3">
                    {t.is_admin ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                        <ShieldCheck className="size-3.5" />
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Terapist</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleSil(t)}
                      disabled={silinenId === t.id}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {silinenId === t.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Hasta Yönetimi Paneli */}
      {yonetimTerapist && (
        <div className="rounded-2xl border border-primary/30 bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">
                {yonetimTerapist.ad} — Hastaları Yönet
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Terapisti silmeden önce bu hastaları başka bir terapiste aktarın veya silin.
              </p>
            </div>
            <button onClick={handleYonetimKapat}>
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>

          {yonetimYukleniyor ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Yükleniyor...
            </div>
          ) : yonetimHastalar.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tüm hastalar aktarıldı/silindi. Terapisti şimdi tekrar silmeyi deneyebilirsiniz.
            </p>
          ) : (
            <div className="space-y-2">
              {yonetimHastalar.map((h) => (
                <div
                  key={h.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{h.ad}</p>
                    <p className="text-xs text-muted-foreground">{h.tani}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleHastaAktar(h.id, Number(e.target.value))
                        }
                      }}
                      disabled={islemHastaId === h.id}
                    >
                      <option value="" disabled>Terapiste aktar...</option>
                      {terapistler
                        .filter(t => t.id !== yonetimTerapist.id)
                        .map(t => (
                          <option key={t.id} value={t.id}>{t.ad} ({t.email})</option>
                        ))}
                    </select>
                    <button
                      onClick={() => handleHastaSil(h.id)}
                      disabled={islemHastaId === h.id}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {islemHastaId === h.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
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