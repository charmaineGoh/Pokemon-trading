import React, { useState } from 'react';
import { apiUrl } from '../api.js';

export default function AddCardModal({ currentUser, onClose, onAdded }) {
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState(7);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  async function recognizeName(file) {
    try {
      setDetecting(true);
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(apiUrl('/api/cards/recognize'), { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.name) {
        setName(data.name);
      }
    } catch (e) {
      console.error('Name detection failed', e);
    } finally {
      setDetecting(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!image) { setError('Please select an image'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('username', currentUser.username);
      if (name) fd.append('name', name);
      fd.append('price', price || '0');
      fd.append('condition', condition || '5');
      fd.append('image', image);
      const res = await fetch(apiUrl('/api/cards/add'), { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) { onAdded(data.card, data.totalValue); onClose(); }
      else setError(data.error || 'Failed to add card');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="card max-w-lg w-full">
        <h2 className="text-xl font-bold text-pokered">Add Card</h2>
        <form onSubmit={submit} className="space-y-3 mt-3">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={e => {
              const file = e.target.files[0];
              setImage(file || null);
              if (file) recognizeName(file);
            }}
          />
          <div>
            <input
              className="border rounded p-2 w-full"
              placeholder={detecting ? 'Detecting name...' : 'Card name'}
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {detecting && <div className="text-xs text-gray-500 mt-1">Reading name from image...</div>}
          </div>
          <div className="flex gap-3">
            <input className="border rounded p-2 w-1/2" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
            <input className="border rounded p-2 w-1/2" type="number" min="1" max="10" placeholder="Condition /10" value={condition} onChange={e => setCondition(e.target.value)} />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-yellow" onClick={onClose}>Cancel</button>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Card'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
