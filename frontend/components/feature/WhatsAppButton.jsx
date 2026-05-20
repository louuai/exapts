'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Floating WhatsApp CTA. Anchored bottom-right above the mobile nav.
 * Customise the phone number via NEXT_PUBLIC_WHATSAPP_NUMBER (international
 * format, digits only — eg "23057201422").
 */
const PHONE   = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '23057201422').replace(/\D/g, '');
const PREFILL = "Bonjour OMEGA, je m'intéresse à un bien à Maurice et souhaiterais en savoir plus.";

export default function WhatsAppButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(PREFILL)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter OMEGA sur WhatsApp"
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ delay: 1.4, duration: 0.4 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      className="fixed z-40 right-4 bottom-20 lg:bottom-6 h-14 w-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-card group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" aria-hidden />
      <svg viewBox="0 0 32 32" className="relative h-7 w-7 fill-current" aria-hidden>
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.633.633 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.426-1.46-2.108a.442.442 0 0 1-.073-.214c0-.555 1.567-.873 1.567-1.396 0-.205-.064-.392-.13-.6-.124-.366-.585-1.476-.745-1.832-.165-.378-.41-.554-.812-.554-.213 0-.396-.045-.585-.045-.305 0-.566.121-.804.317-.378.32-1.16 1.151-1.16 2.598 0 1.45 1.029 2.819 1.144 2.992 1.46 2.04 3.39 3.65 5.766 4.582 1.39.534 2.122.575 2.825.575.61 0 1.456-.087 1.957-.317.55-.25 1.59-.95 1.74-1.946.08-.521.077-.96.012-1.054-.07-.105-.327-.176-.706-.366-.376-.19-2.244-1.097-2.594-1.222-.35-.124-.604-.187-.857.186-.252.373-.748.937-.916 1.13-.168.197-.336.22-.612.075a8.227 8.227 0 0 1-1.66-.99 8.247 8.247 0 0 1-1.563-1.954c-.165-.286-.018-.44.123-.583.131-.13.293-.34.44-.51.146-.171.195-.292.29-.487.094-.193.047-.36-.029-.51-.075-.149-.685-1.65-.937-2.262Z"/>
        <path d="M27.2 4.78A15.93 15.93 0 0 0 15.94 0C7.18 0 .08 7.1.08 15.86c0 2.79.74 5.52 2.13 7.93L0 32l8.43-2.21a15.84 15.84 0 0 0 7.5 1.9h.01c8.76 0 15.86-7.1 15.86-15.86 0-4.23-1.65-8.21-4.6-11.2.0Zm-11.26 24.4c-2.4 0-4.75-.65-6.79-1.86l-.49-.29-5 1.31 1.34-4.88-.32-.5a13.22 13.22 0 0 1-2.04-7.07c0-7.28 5.93-13.2 13.22-13.2 3.53 0 6.85 1.38 9.34 3.87 2.5 2.5 3.87 5.81 3.87 9.34-.01 7.29-5.93 13.28-13.13 13.28Z"/>
      </svg>
    </motion.a>
  );
}
