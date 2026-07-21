'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [hata, setHata] = useState('')
  const router = useRouter()

  const handleGiris = async () => {
    const res = await fetch(
      `http://localhost:8000/auth/giris?email=${email}&sifre=${sifre}`,
      { method: 'POST' }
    )
    const data = await res.json()
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('ad', data.ad)
      localStorage.setItem('is_admin', data.is_admin ? 'true' : 'false')
      router.push('/')
    } else {
      setHata('Email veya şifre yanlış')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">PsikoAI</h1>
          <p className="mt-1 text-sm text-muted-foreground">Terapist girişi</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@klinik.com"
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Şifre</label>
            <input
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          {hata && <p className="text-xs text-destructive">{hata}</p>}
          <button
            onClick={handleGiris}
            className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  )
}