'use client'

import {
  Brain,
  ShieldAlert,
  MessageSquare,
  Anchor,
  Repeat,
  Activity,
  History,
  BarChart3,
  ClipboardList,
  Check,
} from 'lucide-react'

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Brain
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-[18px] text-primary" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}

const riskStyles: Record<string, string> = {
  true: 'bg-destructive/15 text-destructive border-destructive/30',
  false: 'bg-success/15 text-success border-success/30',
}

export function FormulationDetail({ formulasyon }: { formulasyon: any }) {
  if (!formulasyon) return null

  const risk = formulasyon.risk_screening
  const draft = formulasyon.integrated_formulation_draft
  const cognitive = formulasyon.cognitive_structure
  const distortions = formulasyon.distortion_profile?.distortions
  const cycle = formulasyon.vicious_cycle
  const behavioral = formulasyon.behavioral_analysis
  const history = formulasyon.relevant_history
  const scores = formulasyon.psychometric_scores
  const tracking = formulasyon.session_tracking

  return (
    <div className="space-y-6">
      {risk && (
        <div className="flex justify-end">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${riskStyles[String(risk.flag_raised)]}`}
          >
            <ShieldAlert className="size-3.5" />
            {risk.flag_raised ? 'Risk işareti var' : 'Risk işareti yok'}
          </span>
        </div>
      )}

      {risk?.flag_raised && (
        <SectionCard icon={ShieldAlert} title="Risk Ekranı">
          <p className="text-sm text-muted-foreground mb-2">
            Tür: {risk.flag_type?.join(', ')}
          </p>
          {risk.raw_quote_or_paraphrase && (
            <p className="text-sm italic text-muted-foreground border-l-2 border-destructive/40 pl-3">
              "{risk.raw_quote_or_paraphrase}"
            </p>
          )}
        </SectionCard>
      )}

      <SectionCard icon={ClipboardList} title="Bütünleşik Formülasyon">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
          {draft?.narrative_text}
        </p>
        {draft?.priority_treatment_targets?.length > 0 && (
          <ul className="space-y-1.5">
            {draft.priority_treatment_targets.map((t: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {cognitive && (cognitive.core_beliefs || cognitive.intermediate_beliefs || cognitive.automatic_thoughts_this_session) && (
        <SectionCard icon={Anchor} title="Bilişsel Yapı">
          {cognitive.core_beliefs && (
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Çekirdek İnançlar</p>
              <div className="flex flex-wrap gap-2">
                {cognitive.core_beliefs.map((b: any, i: number) => (
                  <span key={i} className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs text-primary">
                    {b.text} ({b.intensity}/10)
                  </span>
                ))}
              </div>
            </div>
          )}
          {cognitive.intermediate_beliefs && (
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Ara İnançlar</p>
              <div className="flex flex-wrap gap-2">
                {cognitive.intermediate_beliefs.map((b: any, i: number) => (
                  <span key={i} className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground">
                    {b.text}
                  </span>
                ))}
              </div>
            </div>
          )}
          {cognitive.automatic_thoughts_this_session && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Bu Seansın Otomatik Düşünceleri</p>
              <ul className="space-y-2">
                {cognitive.automatic_thoughts_this_session.map((t: any, i: number) => (
                  <li key={i} className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
                    {t.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>
      )}

      {distortions && distortions.length > 0 && (
        <SectionCard icon={Brain} title="Bilişsel Çarpıtmalar">
          <div className="space-y-4">
            {distortions.map((d: any, i: number) => (
              <div key={i}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{d.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {d.activation_score}/10 · {d.status}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]"
                    style={{ width: `${d.activation_score * 10}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground italic">"{d.example_quote}"</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {cycle && (
        <SectionCard icon={Repeat} title="Kısır Döngü">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Tetikleyici:</span> {cycle.trigger}</p>
            <p><span className="font-medium text-foreground">Otomatik Düşünce:</span> {cycle.automatic_thought}</p>
            <p><span className="font-medium text-foreground">Duygu/Beden:</span> {cycle.emotion_body}</p>
            <p><span className="font-medium text-foreground">Davranış:</span> {cycle.behavior}</p>
          </div>
        </SectionCard>
      )}

      {behavioral && (
        <SectionCard icon={Activity} title="Davranışsal Analiz">
          {behavioral.avoidance_behaviors?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Kaçınma Davranışları</p>
              <p className="text-sm text-muted-foreground">{behavioral.avoidance_behaviors.join(', ')}</p>
            </div>
          )}
          {behavioral.cost_of_avoidance?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Kaçınmanın Bedeli</p>
              <p className="text-sm text-muted-foreground">{behavioral.cost_of_avoidance.join(', ')}</p>
            </div>
          )}
        </SectionCard>
      )}

      {history && (
        <SectionCard icon={History} title="Yaşam Tarihi">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{history.narrative_text}</p>
        </SectionCard>
      )}

      {scores && scores.length > 0 && (
        <SectionCard icon={BarChart3} title="Psikometrik Ölçekler">
          <div className="space-y-2">
            {scores.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{s.scale_name}</span>
                <span className="font-medium">{s.score}{s.previous_score ? ` (önceki: ${s.previous_score})` : ''}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tracking && (
        <SectionCard icon={MessageSquare} title="Seans Takibi">
          {tracking.homework_given_this_session && (
            <p className="text-sm text-muted-foreground mb-2">
              <span className="font-medium text-foreground">Ödev:</span> {tracking.homework_given_this_session}
            </p>
          )}
          {tracking.next_session_focus_suggestion && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Sonraki Odak:</span> {tracking.next_session_focus_suggestion}
            </p>
          )}
        </SectionCard>
      )}
    </div>
  )
}