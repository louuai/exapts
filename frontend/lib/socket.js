'use client';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let _socket = null;

/** Lazily connect a single Socket.io client, authenticated via JWT. */
export function getSocket() {
  if (typeof window === 'undefined') return null;
  if (_socket && _socket.connected) return _socket;

  const token = window.localStorage.getItem('omega.token');
  if (!token) return null;

  if (_socket) _socket.disconnect();
  _socket = io(API_URL, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
  });
  return _socket;
}

export function disconnectSocket() {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}
