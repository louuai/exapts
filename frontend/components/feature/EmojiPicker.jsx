'use client';
import { useEffect, useRef, useState } from 'react';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

const SETS = {
  '😊': ['😀','😁','😂','🤣','😅','😊','😍','🥰','😘','😎','🤩','🥳','😋','😌','🙃','😉','😏','🤔','🤨','😴','😢','😭','😡','🤯','🥺','😱','🤗','🙄','😬','🤐'],
  '👍': ['👍','👎','👏','🙏','💪','🤝','👌','✌️','🤞','🤟','🙌','🫶','👋','🤚','✋','🖐️','👈','👉','👆','👇','💅','🦾'],
  '❤️': ['❤️','🧡','💛','💚','💙','💜','🤍','🖤','🤎','💔','💕','💖','💘','💝','💞','💗','💓','💟','♥️','💌','💋'],
  '🎉': ['🎉','✨','🔥','💯','⭐','🌟','🏆','🎯','💡','⚡','🌈','☀️','🌙','🌺','🌴','🎁','🎂','🎈','🥂','🍾'],
  '🍕': ['🍕','🍔','🍟','🌮','🌯','🥗','🍣','🍱','🍜','🍝','🥘','🍷','🍺','🍹','☕','🍵','🍰','🍩','🍪','🍫','🍿','🥖'],
  '🏖': ['✈️','🏖️','🌊','🏝️','🗺️','🏔️','🌅','🌇','🌆','🚗','🚕','🛵','🏠','🏡','🏘️','🏨','🏥','⛺','🚤','⛵'],
};

/**
 * Lightweight emoji picker. Single button, opens a popover grid of
 * curated emojis with category tabs. Calls `onPick(emoji)` on click.
 */
export default function EmojiPicker({ onPick, className }) {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState('😊');
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-10 w-10 grid place-items-center rounded-xl text-ink-500 hover:bg-ink-100 transition"
        aria-label="Insérer un emoji"
      >
        <Smile className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute bottom-12 right-0 w-72 rounded-2xl bg-white border border-ink-100 shadow-card overflow-hidden animate-fadeIn z-30">
          {/* Category tabs */}
          <div className="flex items-center gap-0.5 px-1 pt-1.5 border-b border-ink-100">
            {Object.keys(SETS).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setCat(k)}
                className={cn(
                  'flex-1 h-9 rounded-lg text-lg transition',
                  cat === k ? 'bg-brand-50' : 'hover:bg-ink-50'
                )}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="p-1.5 max-h-56 overflow-y-auto grid grid-cols-7 gap-0.5">
            {SETS[cat].map((e, i) => (
              <button
                key={`${e}-${i}`}
                type="button"
                onClick={() => onPick(e)}
                className="h-9 w-9 grid place-items-center rounded-md text-xl hover:bg-ink-100 transition"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
