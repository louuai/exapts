'use client';
import { useRef, useState } from 'react';
import { Image as ImageIcon, Send, X, Upload, Link as LinkIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';

const TAGS = ['Général', 'Administratif', 'Immobilier', 'Lifestyle', 'École', 'Installation'];

export default function PostComposer({ onPosted }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [imageMode, setImageMode] = useState(null); // null | 'upload' | 'url'
  const [tag, setTag] = useState('Général');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  async function submit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.createPost({ content, image: image || null, tag });
      onPosted?.(data.post);
      reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setContent('');
    setImage('');
    setImageMode(null);
  }

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Seules les images sont autorisées.');
      return;
    }
    if (file.size > 1024 * 1024 * 4) {
      setError('Image trop volumineuse (max 4 Mo).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setImage(reader.result); setError(null); };
    reader.readAsDataURL(file);
  }

  function onDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
    setImageMode('upload');
  }

  if (!user) {
    return (
      <div className="rounded-2xl bg-white border border-ink-100 shadow-soft p-5 text-sm text-ink-600">
        Connectez-vous pour publier un message dans la communauté.
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="rounded-2xl bg-white border border-ink-100 shadow-soft p-5"
    >
      <div className="flex gap-3">
        <img src={user.avatar} alt="" className="h-10 w-10 rounded-full ring-2 ring-white shadow-soft object-cover" />
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('community.placeholder')}
            rows={3}
            className="w-full resize-none rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none px-4 py-3"
          />

          {/* Image preview */}
          {image && (
            <div className="mt-3 relative inline-block max-w-full">
              <img src={image} alt="" className="max-h-64 rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => setImage('')}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-ink-900/80 backdrop-blur-sm text-white grid place-items-center hover:bg-ink-900"
                aria-label="Retirer l'image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* URL input mode */}
          {imageMode === 'url' && !image && (
            <div className="mt-3 relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type="url"
                autoFocus
                placeholder="https://…  (URL d'image)"
                onChange={(e) => setImage(e.target.value)}
                className="w-full h-10 pl-9 pr-10 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setImageMode(null)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg grid place-items-center hover:bg-ink-100"
              >
                <X className="h-4 w-4 text-ink-500" />
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => { setImageMode('upload'); fileRef.current?.click(); }}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-semibold text-ink-700 bg-ink-50 hover:bg-ink-100 transition"
                title="Télécharger une image depuis votre appareil"
              >
                <Upload className="h-4 w-4 text-brand-600" />
                Photo
              </button>
              <button
                type="button"
                onClick={() => setImageMode((m) => (m === 'url' ? null : 'url'))}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-semibold text-ink-600 hover:bg-ink-100 transition"
                title="Coller une URL d'image"
              >
                <LinkIcon className="h-4 w-4" />
                URL
              </button>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="h-9 px-2 rounded-xl border border-ink-200 bg-white text-xs font-semibold focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none"
              >
                {TAGS.map((tg) => <option key={tg} value={tg}>{tg}</option>)}
              </select>
            </div>
            <Button type="submit" loading={loading} disabled={!content.trim()} size="sm">
              {loading ? t('community.publishing') : t('community.publish')} <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
          {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}

          <p className="text-[11px] text-ink-400 mt-2">
            Astuce : vous pouvez glisser-déposer une image directement ici.
          </p>
        </div>
      </div>
    </form>
  );
}
