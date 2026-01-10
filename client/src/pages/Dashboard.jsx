import React, { useEffect, useState } from 'react';
import CardGrid from '../components/CardGrid.jsx';
import AddCardModal from '../components/AddCardModal.jsx';
import ShareLinkModal from '../components/ShareLinkModal.jsx';
import { apiUrl } from '../api.js';

function triggerConfetti() {
  const colors = ['#FFCB05', '#3B4CCA', '#FF7F50', '#34D399', '#F472B6'];
  const count = 80;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    piece.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`);
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1300);
  }
}

export default function Dashboard({ currentUser, onLogout, onNavigate }) {
  const [user, setUser] = useState(currentUser);
  const [showAdd, setShowAdd] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [trades, setTrades] = useState([]);

  async function refresh() {
    const res = await fetch(apiUrl(`/api/users/${currentUser.username}`));
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      const total = (data.user.cards || []).reduce((s, c) => s + (Number(c.price) || 0), 0);
      setTotalValue(total);
    }
    const tr = await fetch(apiUrl(`/api/trades/${currentUser.username}`));
    const tdata = await tr.json();
    if (tr.ok) setTrades(tdata.trades || []);
  }

  useEffect(() => { refresh(); }, []);

  function openSharedLink() {
    const input = window.prompt('Paste a share link (e.g., http://localhost:5173/share/ash):');
    if (!input) return;
    try {
      const url = new URL(input);
      const parts = url.pathname.split('/').filter(Boolean);
      const shareIndex = parts.indexOf('share');
      if (shareIndex !== -1 && parts[shareIndex + 1]) {
        const targetUser = parts[shareIndex + 1];
        onNavigate(`/share/${targetUser}`);
      } else {
        alert('Could not find a username in that link.');
      }
    } catch (e) {
      alert('Invalid link. Please paste a valid share URL.');
    }
  }

  const profileImage = currentUser.profilePic ? `/profiles/${currentUser.profilePic}.png` : '/profiles/eevee.png';

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, {currentUser.username}</h1>
              <p className="text-gray-600 text-sm">Manage your collection and trade offers</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="btn flex items-center gap-2"
                >
                  Menu
                  <span className="text-xs">▾</span>
                </button>
                {showActions && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-hover border border-gray-200 z-20 animate-fade-in">
                    <button
                      onClick={() => { setShowActions(false); setShowAdd(true); }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-t-xl font-semibold text-gray-800 transition"
                    >
                      Add Card
                    </button>
                    <button
                      onClick={() => { setShowActions(false); setShowShare(true); }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 font-semibold text-gray-800 transition border-t border-gray-100"
                    >
                      Share Collection
                    </button>
                    <button
                      onClick={() => { setShowActions(false); openSharedLink(); }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-b-xl font-semibold text-gray-800 transition border-t border-gray-100"
                    >
                      Open Shared Link
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl px-4 py-2 shadow-soft hover:shadow-card transition-all duration-200 cursor-pointer border border-gray-200"
                >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-400 ring-2 ring-primary-100">
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <span className="font-semibold text-sm text-gray-700">{currentUser.username}</span>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-hover border border-gray-200 z-10 animate-fade-in">
                  <button 
                    onClick={() => { setShowProfileMenu(false); onLogout(); }}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-xl text-pokered font-semibold transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-soft">
              <div className="text-xs font-medium opacity-90">Total Value</div>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-soft border border-gray-200">
              <div className="text-xs font-medium text-gray-600">Cards</div>
              <div className="text-2xl font-bold text-gray-900">{(user.cards || []).length}</div>
            </div>
          </div>
          <div className="flex gap-2"></div>
        </div>
      </div>

        <div className="mt-4">
          <CardGrid cards={user.cards || []} />
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-gradient-to-r from-pokered to-red-600 text-white px-3 py-1 rounded-lg text-sm">Trade Offers</span>
            {trades && trades.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">{trades.length}</span>
            )}
          </h2>
          <div className="space-y-3 mt-3">
            {(trades || []).map(t => (
              <TradeRow key={t.id} trade={t} refresh={refresh} />
            ))}
            {(!trades || trades.length === 0) && (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                <div className="text-gray-400 text-sm">No trade offers yet. Share your collection to start trading!</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showAdd && <AddCardModal currentUser={currentUser} onClose={() => setShowAdd(false)} onAdded={() => refresh()} />}
      {showShare && <ShareLinkModal username={currentUser.username} onClose={() => setShowShare(false)} />}
    </div>
  );
}

function TradeRow({ trade, refresh }) {
  async function accept() {
    const res = await fetch(apiUrl(`/api/trades/${trade.to}/${trade.id}/accept`), { method: 'POST' });
    if (res.ok) {
      triggerConfetti();
      refresh();
    }
  }
  async function decline() {
    const res = await fetch(apiUrl(`/api/trades/${trade.to}/${trade.id}/decline`), { method: 'POST' });
    if (res.ok) refresh();
  }
  return (
    <div className="card flex items-center justify-between gap-4 hover:shadow-hover transition-all duration-300 border-l-4 border-primary-400">
      <div className="flex-1">
        <div className="font-semibold text-gray-900 text-lg">Offer from <span className="text-primary-600">{trade.from}</span></div>
        <div className="text-sm text-gray-600 mt-1">For your card: <span className="font-medium text-gray-800">{trade.ownerCardId}</span></div>
        <div className="flex items-center gap-2 mt-2">
          <div className="text-sm bg-accent-50 px-3 py-1 rounded-lg border border-accent-200">
            <span className="text-gray-600">Offering:</span> <span className="font-semibold text-gray-900">{trade.offeredCard?.name}</span>
          </div>
          <div className="text-sm bg-green-50 px-3 py-1 rounded-lg border border-green-200 font-semibold text-green-700">
            ${Number(trade.offeredCard?.price || 0).toFixed(2)}
          </div>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        {trade.offeredCard?.imageUrl && (
          <div className="relative group">
            <img src={trade.offeredCard.imageUrl} alt="offer" className="w-24 h-24 object-cover rounded-lg shadow-soft border-2 border-gray-200 group-hover:border-primary-400 transition-all" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <button className="btn" onClick={accept}>Accept</button>
          <button className="btn-yellow" onClick={decline}>Decline</button>
        </div>
      </div>
    </div>
  );
}
