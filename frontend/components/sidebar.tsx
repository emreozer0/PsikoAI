'use client'

import { Brain, Users, Video, Activity, FileText, X, LogOut, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { Patient } from '@/lib/data'

export type View = 'hastalar' | 'seans' | 'analiz' | 'raporlar' | 'admin'

const navItems: { id: View; label: string; icon: typeof Users }[] = [
  { id: 'hastalar', label: 'Hastalar', icon: Users },
  { id: 'seans', label: 'Seanslar', icon: Video },
  { id: 'analiz', label: 'Analiz', icon: Activity },
  { id: 'raporlar', label: 'Raporlar', icon: FileText },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
]

export function Sidebar({
  view,
  onNavigate,
  activePatient,
  open,
  onClose,
}: {
  view: View
  onNavigate: (view: View) => void
  activePatient: Patient | null
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [terapistAd, setTerapistAd] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const ad = localStorage.getItem('ad')
    if (ad) setTerapistAd(ad)
    setIsAdmin(localStorage.getItem('is_admin') === 'true')
  }, [])

  const handleCikis = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('ad')
    localStorage.removeItem('is_admin')
    router.push('/login')
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 shadow-[0_0_20px_-4px_var(--color-primary)]">
              <Brain className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold leading-none tracking-tight">
                PsikoAI
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Terapi Platformu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Menüyü kapat"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_var(--color-primary)] shadow-primary/20'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
                )}
              >
                <item.icon className="size-[18px]" />
                {item.label}
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                )}
              </button>
            )
          })}

          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                view === 'admin'
                  ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_var(--color-primary)] shadow-primary/20'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
              )}
            >
              <ShieldCheck className="size-[18px]" />
              Admin Paneli
              {view === 'admin' && (
                <span className="ml-auto size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
              )}
            </button>
          )}
        </nav>

        <div className="p-3 space-y-3">
          <div>
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Seçili Hasta
            </p>
            {activePatient ? (
              <div className="rounded-xl border border-sidebar-border bg-card p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {activePatient.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {activePatient.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {activePatient.diagnosis}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-sidebar-border p-3 text-center text-xs text-muted-foreground">
                Hasta seçilmedi
              </div>
            )}
          </div>

          <div className="px-2 py-2 text-xs text-muted-foreground border-t border-sidebar-border">
            <p className="font-medium text-foreground">{terapistAd}</p>
            <p>{isAdmin ? 'Admin' : 'Terapist'}</p>
          </div>

          <button
            onClick={handleCikis}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="size-[18px]" />
            Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  )
}