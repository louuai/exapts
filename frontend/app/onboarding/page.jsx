'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, CalendarDays, Check, Euro, HeartHandshake, Loader2, Phone, Sparkles, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, title: 'Intent', icon: Sparkles },
  { id: 2, title: 'Budget', icon: Euro },
  { id: 3, title: 'Lifestyle', icon: Users },
  { id: 4, title: 'Services', icon: BriefcaseBusiness },
  { id: 5, title: 'Timeline', icon: CalendarDays },
  { id: 6, title: 'Contact', icon: Phone },
];

const defaults = {
  intent: '',
  budgetRange: '',
  household: '',
  hasKids: false,
  luxuryPreference: false,
  lifestyleAreas: [],
  servicesNeeded: [],
  arrivalDate: '',
  duration: '',
  contactPreferences: [],
};

const choices = {
  intent: [
    ['live', 'Vivre', 'Installer votre quotidien a Maurice'],
    ['invest', 'Investir', 'Immobilier, ROI et fiscalite'],
    ['retirement', 'Retraite', 'Calme, sante et confort'],
    ['vacation', 'Sejour', 'Explorer avant de decider'],
    ['business', 'Business', 'Creer ou developper une activite'],
  ],
  budgetRange: [
    ['lt_2000', '< 2 000 EUR', 'Essentiel et efficace'],
    ['2000_5000', '2 000 - 5 000 EUR', 'Confort installe'],
    ['5000_20000', '5 000 - 20k EUR', 'Premium relocation'],
    ['gt_20000', '20k EUR+', 'VIP, investissement et concierge'],
  ],
  household: [
    ['alone', 'Seul', 'Profil solo'],
    ['couple', 'Couple', 'Installation a deux'],
    ['family', 'Famille', 'Enfants, ecoles, sante'],
  ],
  lifestyleAreas: [
    ['beach', 'Plage'],
    ['city', 'Ville'],
    ['calm', 'Calme'],
    ['business', 'Business area'],
  ],
  servicesNeeded: [
    ['real_estate', 'Immobilier'],
    ['tax_optimization', 'Optimisation fiscale'],
    ['banking', 'Banque'],
    ['visa_assistance', 'Visa assistance'],
    ['relocation', 'Relocation'],
    ['schooling', 'Scolarite'],
    ['healthcare', 'Sante'],
    ['concierge', 'Concierge'],
    ['car_rental', 'Location voiture'],
    ['investment_advisory', 'Conseil investissement'],
  ],
  duration: [
    ['short_term', 'Court terme'],
    ['long_term', 'Long terme'],
    ['permanent', 'Installation permanente'],
  ],
  contactPreferences: [
    ['whatsapp', 'WhatsApp'],
    ['email', 'Email'],
    ['phone', 'Telephone'],
    ['concierge_callback', 'Callback concierge'],
  ],
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const progress = Math.round((step / steps.length) * 100);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    let active = true;
    api.onboardingMe()
      .then((data) => {
        if (!active) return;
        if (data.profile?.completed) {
          router.replace('/dashboard');
          return;
        }
        const profile = data.profile || {};
        setStep(profile.currentStep || 1);
        setForm({
          ...defaults,
          ...profile,
          arrivalDate: profile.arrivalDate ? String(profile.arrivalDate).slice(0, 10) : '',
          lifestyleAreas: profile.lifestyleAreas || [],
          servicesNeeded: profile.servicesNeeded || [],
          contactPreferences: profile.contactPreferences || [],
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => autosave(), 500);
    return () => clearTimeout(timer);
  }, [form, step]);

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(form.intent);
    if (step === 2) return Boolean(form.budgetRange);
    if (step === 3) return Boolean(form.household);
    if (step === 4) return form.servicesNeeded.length > 0;
    if (step === 5) return Boolean(form.duration);
    if (step === 6) return form.contactPreferences.length > 0;
    return true;
  }, [step, form]);

  function update(key, value) {
    setForm((curr) => ({ ...curr, [key]: value }));
  }

  function toggleList(key, value) {
    setForm((curr) => {
      const list = curr[key] || [];
      return { ...curr, [key]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] };
    });
  }

  async function autosave() {
    setSaving(true);
    try {
      await api.saveOnboarding({ ...form, currentStep: step, completed: false });
    } catch {
      // Keep the flow uninterrupted; final submit surfaces errors.
    } finally {
      setSaving(false);
    }
  }

  async function complete() {
    if (!canContinue) return;
    setSaving(true);
    setError(null);
    try {
      await api.completeOnboarding({ ...form });
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || authLoading) {
    return <div className="grid min-h-screen place-items-center bg-ink-950 text-white"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dff7f4_0,#ffffff_34%,#f5f7fb_100%)] px-4 py-6">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden lg:block">
          <div className="rounded-[2rem] bg-ink-950 p-8 text-white shadow-card">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-100">
              <HeartHandshake className="h-4 w-4" /> OMEGA Intelligence
            </div>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-tight">
              Votre relocation engine personnel.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-ink-300">
              OMEGA qualifie votre projet, priorise vos besoins et connecte votre profil aux bons biens, guides, services et partenaires.
            </p>
            <div className="mt-8 grid gap-3">
              {['Scoring business', 'Recommandations personnalisees', 'Routage premium partenaires'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 text-sm font-semibold">
                  <Check className="h-4 w-4 text-brand-300" /> {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-100 bg-white/95 p-5 shadow-card lg:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Onboarding</p>
              <h2 className="font-display text-2xl font-extrabold text-ink-950">{steps[step - 1].title}</h2>
            </div>
            <div className="text-right text-xs font-bold text-ink-500">
              {saving ? 'Sauvegarde...' : 'Autosave actif'}
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-6 gap-2">
            {steps.map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => setStep(id)} className={cn('grid h-10 place-items-center rounded-xl border transition', id <= step ? 'border-brand-100 bg-brand-50 text-brand-700' : 'border-ink-100 bg-white text-ink-400')}>
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <div className="mt-7 min-h-[360px]">
            {step === 1 && <ChoiceGrid value={form.intent} options={choices.intent} onPick={(v) => update('intent', v)} />}
            {step === 2 && <ChoiceGrid value={form.budgetRange} options={choices.budgetRange} onPick={(v) => update('budgetRange', v)} />}
            {step === 3 && (
              <div className="space-y-5">
                <ChoiceGrid value={form.household} options={choices.household} onPick={(v) => update('household', v)} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Toggle active={form.hasKids} onClick={() => update('hasKids', !form.hasKids)}>Enfants</Toggle>
                  <Toggle active={form.luxuryPreference} onClick={() => update('luxuryPreference', !form.luxuryPreference)}>Preference luxe</Toggle>
                </div>
                <MultiGrid values={form.lifestyleAreas} options={choices.lifestyleAreas} onToggle={(v) => toggleList('lifestyleAreas', v)} />
              </div>
            )}
            {step === 4 && <MultiGrid values={form.servicesNeeded} options={choices.servicesNeeded} onToggle={(v) => toggleList('servicesNeeded', v)} />}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink-800">Date d'arrivee estimee</label>
                  <input type="date" value={form.arrivalDate || ''} onChange={(e) => update('arrivalDate', e.target.value)} className="h-12 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
                </div>
                <MultiGrid single values={[form.duration].filter(Boolean)} options={choices.duration} onToggle={(v) => update('duration', v)} />
              </div>
            )}
            {step === 6 && <MultiGrid values={form.contactPreferences} options={choices.contactPreferences} onToggle={(v) => toggleList('contactPreferences', v)} />}
          </div>

          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <div className="mt-6 flex justify-between gap-3 border-t border-ink-100 pt-4">
            <Button variant="secondary" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>Retour</Button>
            {step < 6 ? (
              <Button disabled={!canContinue} onClick={() => setStep((s) => Math.min(6, s + 1))}>Continuer</Button>
            ) : (
              <Button disabled={!canContinue} loading={saving} onClick={complete}>Generer mon experience</Button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ChoiceGrid({ value, options, onPick }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map(([id, label, desc]) => (
        <button key={id} onClick={() => onPick(id)} className={cn('rounded-2xl border p-4 text-left transition', value === id ? 'border-brand-300 bg-brand-50 shadow-soft' : 'border-ink-100 bg-white hover:border-ink-200 hover:bg-ink-50')}>
          <p className="font-display text-lg font-extrabold text-ink-950">{label}</p>
          {desc && <p className="mt-1 text-sm leading-6 text-ink-500">{desc}</p>}
        </button>
      ))}
    </div>
  );
}

function MultiGrid({ values, options, onToggle }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map(([id, label]) => (
        <Toggle key={id} active={values.includes(id)} onClick={() => onToggle(id)}>{label}</Toggle>
      ))}
    </div>
  );
}

function Toggle({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={cn('flex min-h-12 items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-bold transition', active ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-ink-100 bg-white text-ink-700 hover:bg-ink-50')}>
      {children}
      {active && <Check className="h-4 w-4" />}
    </button>
  );
}
