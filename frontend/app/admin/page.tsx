'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Check } from 'lucide-react'
import { Sidebar, type View } from '@/components/sidebar'
import { PatientsView } from '@/components/patients-view'
import { SessionView } from '@/components/session-view'
import { AnalysisView } from '@/components/analysis-view'
import { ReportsView } from '@/components/reports-view'
import { type Patient } from '@/lib/data'

export default function Page() {
  const [view, setView] = useState<View>('hastalar')
  const [activePatient, setActivePatient] = useState<Patient | null>(null)
  const [transkript, setTranskript] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [])

  const navigate = (v: View) => {
    setView(v)
    setSidebarOpen(false)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        view={view}
        onNavigate={navigate}
        activePatient={activePatient}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Menüyü aç"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-semibold tracking-tight">PsikoAI</span>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {view === 'hastalar' && (
            <PatientsView
              onStartSession={(p) => {
                setActivePatient(p)
                setView('seans')
              }}
              onView={(p) => {
                setActivePatient(p)
                setView('analiz')
              }}
            />
          )}
          {view === 'seans' && (
            <SessionView
              patient={activePatient}
              onTranscribe={(t) => {
                setTranskript(t)
                setView('analiz')
              }}
            />
          )}
          {view === 'analiz' && (
            <AnalysisView
              patient={activePatient}
              transkript={transkript}
              onSave={() => {
                setTranskript('')
                showToast('Analiz onaylandı ve hasta dosyasına kaydedildi.')
                setView('hastalar')
              }}
            />
          )}
          {view === 'raporlar' && <ReportsView />}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-xl border border-primary/30 bg-card px-4 py-3 text-sm shadow-[0_0_30px_-8px_var(--color-primary)]">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary/15">
            <Check className="size-3.5 text-primary" />
          </span>
          {toast}
        </div>
      )}
    </div>
  )
}