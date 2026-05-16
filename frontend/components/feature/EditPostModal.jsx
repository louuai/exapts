'use client';
import { useEffect, useRef, useState } from 'react';
import { Save, X, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';

const TAGS = ['Général', 'Administratif', 'Immobilier', 'Lifestyle', 'École', 'Installation'];

export default function EditPostModal({ open, onClose, post, onUpdated }) {
  const [content, setContent] = useState(post?.content || '');
  const [image, setImage] = useState(post?.image || '');
  const [tag, setTag] = useState(post?.tag || 'Général');
  const [imageMode, setImageMode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open && post) {
      setContent(post.content || '');
      setImage(post.image || '');
      setTag(post.tag || 'Général');
      setImageMode(null);
      setError(null);
    }
  }, [open, post]);

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Seules les images sont autorisées.'); return; }
    if (file.size > 1024 * 1024 * 4) { setError('Image trop volumineuse (max 4 Mo).'); return; }
    const reader = new FileReader();
    reader.onload = () => { setImage(reader.result); setError(null); };
    reader.readAsDataURL(file);
  }

  async function submit(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const data = await api.updatePost(post.id, { content, image: image || null, tag });
      onUpdated?.(data.post);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!post) return null;

  return (
    <Modal open={open} onClose={onClose} title="Modifier le post" subtitle="Mettez à jour votre publication." maxWidth="max-w-lg">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 mt-0.5" /> {error}
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
          className="w-full resize-none rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none px-4 py-3"
        />

        {image && (
          <div className="relative inline-block max-w-full">
            <img src={image} alt="" className="max-h-56 rounded-xl object-cover" />
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

        {imageMode === 'url' && !image && (
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="url"
              autoFocus
              placeholder="https://…"
              onChange={(e) => setImage(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-ink-200 bg-white text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
            />
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => { setImageMode('upload'); fileRef.current?.click(); }}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-semibold text-ink-700 bg-ink-50 hover:bg-ink-100"
          >
            <Upload className="h-4 w-4 text-brand-600" />
            {image ? 'Changer la photo' : 'Photo'}
          </button>
          <button
            type="button"
            onClick={() => setImageMode((m) => (m === 'url' ? null : 'url'))}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-semibold text-ink-600 hover:bg-ink-100"
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

        <div className="flex justify-end gap-2 pt-3 border-t border-ink-100">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ink-100">
            Annuler
          </button>
          <Button type="submit" loading={saving} disabled={!content.trim()} className="rounded-xl">
            <Save className="h-4 w-4" />
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
