import React, { useState, useEffect } from 'react';

export default function TradeModal({ targetCard, currentUser, onClose, onCreated }) {
  const [mode, setMode] = useState('existing'); // 'existing' or 'upload'
  const [myCards, setMyCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [offeredImage, setOfferedImage] = useState(null);
  const [offeredName, setOfferedName] = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [offeredCondition, setOfferedCondition] = useState(7);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMyCards() {
      const res = await fetch(`/api/users/${currentUser.username}`);
      const data = await res.json();
      if (res.ok) setMyCards(data.user.cards || []);
    }
    loadMyCards();
  }, [currentUser.username]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('ownerUsername', targetCard.owner || currentUser.username);
      fd.append('requesterUsername', currentUser.username);
      fd.append('ownerCardId', targetCard.id);
      
      if (mode === 'existing' && selectedCardId) {
        // User selected existing card
        fd.append('offeredCardId', selectedCardId);
      } else if (mode === 'upload') {
        // User uploaded new card
        if (offeredImage) fd.append('offeredImage', offeredImage);
        if (offeredName) fd.append('offeredName', offeredName);
        fd.append('offeredPrice', offeredPrice || '0');
        fd.append('offeredCondition', offeredCondition || '5');
      } else {
        setError('Please select a card or upload one');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/trades/create', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) { onCreated(data.trade); onClose(); }
      else setError(data.error || 'Failed to create trade');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="card max-w-2xl w-full my-4">
        <h2 className="text-xl font-bold text-pokered">Offer a Trade</h2>
        <p className="text-sm text-gray-700">For: {targetCard.name}</p>
        
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            className={`flex-1 py-2 rounded ${mode === 'existing' ? 'bg-pokeblue text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setMode('existing')}
          >
            From My Collection
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded ${mode === 'upload' ? 'bg-pokeblue text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setMode('upload')}
          >
            Upload New Card
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3 mt-3">
          {mode === 'existing' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select a card to offer:</label>
              {myCards.length === 0 ? (
                <div className="text-sm text-gray-600">You don't have any cards yet. Switch to "Upload New Card" to add one.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2 border rounded">
                  {myCards.map(card => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`cursor-pointer border-2 rounded-lg p-2 transition ${
                        selectedCardId === card.id ? 'border-pokeblue bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {card.imageUrl && (
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="w-full object-cover rounded mb-2"
                          style={{ aspectRatio: '63 / 88' }}
                        />
                      )}
                      <div className="text-sm font-semibold truncate">{card.name}</div>
                      <div className="text-xs text-gray-600">${Number(card.price || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Condition: {card.condition}/10</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'upload' && (
            <>
              <input type="file" accept="image/*" onChange={e => setOfferedImage(e.target.files[0])} />
              <input className="border rounded p-2 w-full" placeholder="Offered Card Name (optional)" value={offeredName} onChange={e => setOfferedName(e.target.value)} />
              <div className="flex gap-3">
                <input className="border rounded p-2 w-1/2" placeholder="Price" value={offeredPrice} onChange={e => setOfferedPrice(e.target.value)} />
                <input className="border rounded p-2 w-1/2" type="number" min="1" max="10" placeholder="Condition /10" value={offeredCondition} onChange={e => setOfferedCondition(e.target.value)} />
              </div>
            </>
          )}

          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-yellow" onClick={onClose}>Cancel</button>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Offer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
