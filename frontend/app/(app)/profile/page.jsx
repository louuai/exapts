'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User, Heart, Calendar, MessageSquare, Settings, ShieldCheck, Camera, Save, KeyRound, Bell, AlertCircle, CheckCircle2, Newspaper, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import Button from '@/components/ui/Button';
import PostCard from '@/components/feature/PostCard';
import PostComposer from '@/components/feature/PostComposer';
import { PostSkeleton } from '@/components/ui/Skeleton';

const TABS = [
  { id: 'account',   label: 'Mon compte',  icon: User },
  { id: 'posts',     label: 'Mes posts',   icon: Newspaper },
  { id: 'favorites', label: 'Favoris',     icon: Heart },
  { id: 'visits',    label: 'Visites',     icon: Calendar },
  { id: 'messages',  label: 'Messages',    icon: MessageSquare },
  { id: 'settings',  label: 'Paramètres',  icon: Settings },
];

export default function ProfilePage() {
  return (
    <Suspense fallback={<p className="text-ink-500 max-w-6xl mx-auto">Chargement…</p>}>
      <ProfilePageInner />
    </Suspense>
  );
}

function ProfilePageInner() {
  const { user, loading } = useAuth();
  const search = useSearchParams();
  const router = useRouter();
  const tab = TABS.find((t) => t.id === search.get('tab'))?.id || 'account';

  if (loading) return null;
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fadeIn">
        <User className="h-10 w-10 mx-auto text-ink-300" />
        <h1 className="font-display font-bold text-2xl mt-4">Connexion requise</h1>
        <p className="text-ink-600 mt-2">Connectez-vous pour accéder à votre profil.</p>
        <Link href="/login" className="inline-flex mt-4 h-11 px-5 items-center bg-ink-900 text-white rounded-xl font-semibold hover:bg-ink-800 transition">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <img
          src={user.avatar}
          alt={user.name}
          className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-soft"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-brand-700">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">Compte vérifié</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl mt-1 text-ink-900">{user.name}</h1>
          <p className="text-sm text-ink-500">{user.email} · Membre depuis {formatDate(user.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tabs sidebar */}
        <aside className="lg:col-span-3">
          <nav className="rounded-2xl bg-white border border-ink-100 shadow-soft p-2 lg:sticky lg:top-20 flex lg:flex-col gap-1 overflow-x-auto">
            {TABS.map((it) => {
              const Icon = it.icon;
              const active = tab === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => router.replace(`/profile?tab=${it.id}`)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 lg:w-full',
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-600 hover:bg-ink-50'
                  )}
                >
                  <Icon className={cn('h-4 w-4', active ? 'text-brand-600' : 'text-ink-400')} />
                  {it.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Panel */}
        <main className="lg:col-span-9">
          {tab === 'account'   && <AccountPanel />}
          {tab === 'posts'     && <MyPostsPanel />}
          {tab === 'favorites' && <FavoritesPanel />}
          {tab === 'visits'    && <VisitsPanel />}
          {tab === 'messages'  && <MessagesPanel />}
          {tab === 'settings'  && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}

/* ---------- Account ---------- */
function AccountPanel() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    location: user.location || '',
    bio: user.bio || '',
    avatar: user.avatar || '',
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); setStatus(null); }

  async function onAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024 * 2) {
      setStatus({ kind: 'error', msg: 'Image trop volumineuse (max 2 Mo).' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update('avatar', reader.result);
    reader.readAsDataURL(file);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await api.updateProfile(form);
      await refresh();
      setStatus({ kind: 'ok', msg: 'Profil mis à jour avec succès.' });
    } catch (err) {
      setStatus({ kind: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <PanelCard title="Mes informations" subtitle="Ces informations sont visibles par votre agent OMEGA.">
      <div className="flex justify-end -mt-3 mb-2">
        <Link
          href={`/users/${user.id}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
        >
          <ExternalLink className="h-3 w-3" />
          Voir mon profil public
        </Link>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <div className="flex items-center gap-5">
          <img src={form.avatar} alt="" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-soft" />
          <div>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 hover:bg-ink-50 cursor-pointer">
              <Camera className="h-4 w-4" />
              Changer la photo
              <input type="file" accept="image/*" onChange={onAvatar} className="hidden" />
            </label>
            <p className="text-xs text-ink-500 mt-1.5">JPG ou PNG, max 2 Mo.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nom complet" value={form.name}  onChange={(v) => update('name', v)} />
          <FormField label="Email"       value={user.email} disabled />
          <FormField label="Téléphone"   value={form.phone} onChange={(v) => update('phone', v)} placeholder="+33 6 12 34 56 78" />
          <FormField label="Localisation à Maurice" value={form.location} onChange={(v) => update('location', v)} placeholder="Grand Baie" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink-800 mb-1.5">Bio</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            placeholder="Quelques mots sur vous, votre projet…"
            className="w-full px-3 py-2.5 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none resize-none"
          />
        </div>

        {status && <StatusLine kind={status.kind}>{status.msg}</StatusLine>}

        <Button type="submit" loading={saving} className="rounded-xl">
          <Save className="h-4 w-4" /> Enregistrer
        </Button>
      </form>
    </PanelCard>
  );
}

/* ---------- Favorites ---------- */
function FavoritesPanel() {
  const [list, setList] = useState(null);
  useEffect(() => {
    api.favorites().then((d) => setList(d.favorites)).catch(() => setList([]));
  }, []);
  return (
    <PanelCard
      title="Mes biens favoris"
      subtitle="Vos coups de cœur sauvegardés pour comparer plus tard."
    >
      {list === null ? (
        <p className="text-ink-500 py-8 text-center">Chargement…</p>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Aucun favori pour le moment"
          body="Ajoutez vos coups de cœur depuis la page Immobilier."
        >
          <Link href="/properties" className="inline-flex mt-4 h-10 px-4 items-center bg-ink-900 text-white rounded-xl font-semibold text-sm hover:bg-ink-800">
            Parcourir les biens
          </Link>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((p) => (
            <Link
              key={p.id}
              href={`/properties/${p.id}`}
              className="flex gap-3 rounded-2xl border border-ink-100 bg-white p-3 shadow-soft hover:shadow-card transition-all"
            >
              <img src={p.images[0]} alt="" className="h-20 w-28 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-ink-900 truncate">{p.title}</p>
                <p className="text-xs text-ink-500 mt-0.5">{p.location} · {p.surface} m²</p>
                <p className="font-display font-extrabold text-ink-900 mt-1.5">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: p.currency, maximumFractionDigits: 0 }).format(p.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PanelCard>
  );
}

/* ---------- My Posts (publier + voir tous ses posts) ---------- */
function MyPostsPanel() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.userPosts(user.id)
      .then((d) => setPosts(d.posts))
      .catch(() => setPosts([]));
  }, [user]);

  return (
    <div className="space-y-5">
      <PanelCard title="Publier" subtitle="Partagez avec la communauté OMEGA.">
        <PostComposer
          onPosted={(p) => setPosts((curr) => [p, ...(curr || [])])}
        />
      </PanelCard>

      <PanelCard
        title="Toutes mes publications"
        subtitle={posts === null ? '…' : `${posts.length} post${posts.length > 1 ? 's' : ''}`}
      >
        <div className="flex items-center justify-between mb-4 -mt-2">
          <Link
            href={`/users/${user.id}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            <ExternalLink className="h-3 w-3" />
            Voir mon profil public
          </Link>
        </div>

        {posts === null ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="Aucune publication"
            body="Partagez votre première expérience avec la communauté !"
          />
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onDeleted={(id) => setPosts((curr) => curr.filter((x) => x.id !== id))}
                onUpdated={(u) => setPosts((curr) => curr.map((x) => (x.id === u.id ? u : x)))}
              />
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}

/* ---------- Visits ---------- */
function VisitsPanel() {
  const [list, setList] = useState(null);
  useEffect(() => {
    api.visitRequests().then((d) => setList(d.visitRequests)).catch(() => setList([]));
  }, []);

  return (
    <PanelCard title="Mes demandes de visite" subtitle="Suivi en temps réel par votre agent OMEGA.">
      {list === null ? <p className="text-ink-500 py-8 text-center">Chargement…</p>
      : list.length === 0 ? (
        <EmptyState icon={Calendar} title="Aucune demande" body="Demandez une visite depuis une fiche bien.">
          <Link href="/properties" className="inline-flex mt-4 h-10 px-4 items-center bg-ink-900 text-white rounded-xl font-semibold text-sm hover:bg-ink-800">
            Parcourir les biens
          </Link>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-ink-100">
          {list.map((v) => (
            <li key={v.id} className="py-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink-900">
                  <Link href={`/properties/${v.propertyId}`} className="hover:text-brand-700">
                    Visite — {v.propertyId}
                  </Link>
                </p>
                <p className="text-sm text-ink-500 mt-0.5">
                  Date souhaitée : <strong>{v.preferredDate || 'à définir'}</strong>
                </p>
                {v.message && <p className="text-sm text-ink-600 mt-1.5 italic">"{v.message}"</p>}
                <p className="text-xs text-ink-400 mt-1">Envoyée {timeAgo(v.createdAt)}</p>
              </div>
              <StatusPill status={v.status} />
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

/* ---------- Messages ---------- */
function MessagesPanel() {
  const [list, setList] = useState(null);
  useEffect(() => {
    api.messages().then((d) => setList(d.messages)).catch(() => setList([]));
  }, []);

  return (
    <PanelCard title="Mes messages envoyés" subtitle="Tous vos échanges avec nos agents.">
      {list === null ? <p className="text-ink-500 py-8 text-center">Chargement…</p>
      : list.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Aucun message" body="Posez vos questions à un agent depuis une fiche bien." />
      ) : (
        <ul className="divide-y divide-ink-100">
          {list.map((m) => (
            <li key={m.id} className="py-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-ink-900">
                  <Link href={`/properties/${m.propertyId}`} className="hover:text-brand-700">
                    {m.propertyId}
                  </Link>
                </p>
                <StatusPill status={m.status} />
              </div>
              <p className="text-sm text-ink-700 mt-2">{m.body}</p>
              <p className="text-xs text-ink-400 mt-1">{timeAgo(m.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}

/* ---------- Settings ---------- */
function SettingsPanel() {
  return (
    <div className="space-y-6">
      <PasswordCard />
      <NotificationsCard />
    </div>
  );
}

function PasswordCard() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await api.changePassword(form);
      setStatus({ kind: 'ok', msg: 'Mot de passe mis à jour.' });
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setStatus({ kind: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <PanelCard title="Mot de passe" subtitle="Modifiez votre mot de passe.">
      <form onSubmit={submit} className="space-y-4 max-w-md">
        <FormField type="password" label="Mot de passe actuel" required value={form.currentPassword} onChange={(v) => setForm((f) => ({ ...f, currentPassword: v }))} />
        <FormField type="password" label="Nouveau mot de passe" required value={form.newPassword} onChange={(v) => setForm((f) => ({ ...f, newPassword: v }))} />
        {status && <StatusLine kind={status.kind}>{status.msg}</StatusLine>}
        <Button type="submit" loading={saving} className="rounded-xl">
          <KeyRound className="h-4 w-4" /> Mettre à jour
        </Button>
      </form>
    </PanelCard>
  );
}

function NotificationsCard() {
  const { user, refresh } = useAuth();
  const [prefs, setPrefs] = useState(user.notificationPrefs || {});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const labels = {
    newProperties: 'Nouveaux biens correspondant à mes critères',
    communityReplies: 'Réponses à mes posts dans la communauté',
    weeklyDigest: 'Récap hebdomadaire OMEGA',
  };

  function toggle(k) { setPrefs((p) => ({ ...p, [k]: !p[k] })); setStatus(null); }

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      await api.updateProfile({ notificationPrefs: prefs });
      await refresh();
      setStatus({ kind: 'ok', msg: 'Préférences enregistrées.' });
    } catch (err) {
      setStatus({ kind: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <PanelCard title="Notifications" subtitle="Choisissez ce que vous souhaitez recevoir.">
      <div className="space-y-3">
        {Object.entries(labels).map(([k, label]) => (
          <label key={k} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-ink-50 border border-ink-100 cursor-pointer">
            <span className="flex items-center gap-2 text-sm font-semibold text-ink-800">
              <Bell className="h-4 w-4 text-ink-400" /> {label}
            </span>
            <Switch checked={!!prefs[k]} onChange={() => toggle(k)} />
          </label>
        ))}
        {status && <StatusLine kind={status.kind}>{status.msg}</StatusLine>}
        <Button onClick={save} loading={saving} className="rounded-xl">
          <Save className="h-4 w-4" /> Enregistrer
        </Button>
      </div>
    </PanelCard>
  );
}

/* ---------- Primitives ---------- */
function PanelCard({ title, subtitle, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-white border border-ink-100 shadow-soft p-5 lg:p-7"
    >
      <header className="mb-5">
        <h2 className="font-display font-bold text-xl text-ink-900">{title}</h2>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </header>
      {children}
    </motion.section>
  );
}

function FormField({ label, value, onChange, required, type = 'text', disabled, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-800 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full h-11 px-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none disabled:bg-ink-50 disabled:text-ink-500"
      />
    </div>
  );
}

function StatusLine({ kind, children }) {
  const isOk = kind === 'ok';
  const Icon = isOk ? CheckCircle2 : AlertCircle;
  return (
    <div className={cn('flex items-start gap-2 rounded-xl border px-3 py-2 text-sm',
      isOk ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700')}>
      <Icon className="h-4 w-4 mt-0.5" />
      {children}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    new:       { tone: 'bg-brand-50 text-brand-700 border-brand-200',     label: 'Nouvelle' },
    pending:   { tone: 'bg-amber-50 text-amber-700 border-amber-200',     label: 'En attente' },
    confirmed: { tone: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Confirmée' },
    contacted: { tone: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Contactée' },
    done:      { tone: 'bg-ink-100 text-ink-700 border-ink-200',          label: 'Terminée' },
    cancelled: { tone: 'bg-rose-50 text-rose-700 border-rose-200',        label: 'Annulée' },
    open:      { tone: 'bg-brand-50 text-brand-700 border-brand-200',     label: 'Ouvert' },
    answered:  { tone: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Répondu' },
  };
  const s = map[status] || { tone: 'bg-ink-100 text-ink-700 border-ink-200', label: status };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0', s.tone)}>
      {s.label}
    </span>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-10 rounded-full transition-colors',
        checked ? 'bg-brand-600' : 'bg-ink-300'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[1.125rem]' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

function EmptyState({ icon: Icon, title, body, children }) {
  return (
    <div className="text-center py-10">
      <Icon className="h-10 w-10 mx-auto text-ink-300" />
      <p className="font-display font-bold text-ink-900 mt-3">{title}</p>
      <p className="text-sm text-ink-500 mt-1 max-w-sm mx-auto">{body}</p>
      {children}
    </div>
  );
}
