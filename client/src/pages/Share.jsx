import React, { useEffect, useState } from 'react';
import CardGrid from '../components/CardGrid.jsx';
import TradeModal from '../components/TradeModal.jsx';
import { apiUrl } from '../api.js';

const PROFILE_PICS = [
  { name: 'eevee', label: 'Eevee', img: '/profiles/eevee.png' },
  { name: 'squirtle', label: 'Squirtle', img: '/profiles/squirtle.png' },
  { name: 'charmander', label: 'Charmander', img: '/profiles/charmander.png' },
  { name: 'bulbasaur', label: 'Bulbasaur', img: '/profiles/bulbasaur.png' }
];

export default function Share({ username, currentUser: globalUser, onHome }) {
  const [collection, setCollection] = useState({ username, cards: [] });
  const [currentUser, setCurrentUser] = useState(globalUser);
  const [showTrade, setShowTrade] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginProfilePic, setLoginProfilePic] = useState('eevee');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch(apiUrl(`/api/share/${username}`));
      const data = await res.json();
      if (res.ok) setCollection(data.collection);
    }
    load();
    // If user is already logged in globally, use that
    if (globalUser) {
      setCurrentUser(globalUser);
    } else {
      // Otherwise check for share viewer user (temporary login for viewing only)
      const stored = localStorage.getItem('shareViewerUser');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      } else {
        setShowLogin(true);
      }
    }
  }, [username, globalUser]);

  async function handleLogin(e) {
    e.preventDefault();
    const uname = loginUsername.trim().toLowerCase();
    if (!uname) { setLoginError('Please enter a username'); return; }
    try {
      const endpoint = authMode === 'signup' ? '/api/users/signup' : '/api/users/login';
      const payload = authMode === 'signup' ? { username: uname, profilePic: loginProfilePic } : { username: uname };
      const res = await fetch(apiUrl(endpoint), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }
      if (res.ok) {
        setCurrentUser(data.user);
        // Store in shareViewerUser, not currentUser, to avoid overwriting main app login
        localStorage.setItem('shareViewerUser', JSON.stringify(data.user));
        setShowLogin(false);
        setLoginError('');
        setLoginUsername('');
        setLoginProfilePic('eevee');
        setAuthMode('login');
      } else if (authMode === 'signup' && res.status === 409) {
        setLoginError('Username already taken');
      } else if (authMode === 'login' && res.status === 404) {
        setLoginError('Username not found. Please sign up.');
      } else {
        setLoginError(data.error || `Login failed (${res.status})`);
      }
    } catch {
      setLoginError('Network error');
    }
  }

  function onTrade(card) {
    setShowTrade({ ...card, owner: collection.username });
  }

  const canTrade = currentUser && currentUser.username !== collection.username;
  const isOwner = currentUser && currentUser.username === collection.username;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{collection.username}'s Collection</h1>
              <p className="text-gray-600 text-sm mt-1">Browse and trade Pokémon cards</p>
            </div>
            <div className="flex gap-2 items-center">
              {!currentUser && <button className="btn-yellow" onClick={() => setShowLogin(true)}>Login to View</button>}
              {currentUser && (
                <div className="bg-primary-50 px-4 py-2 rounded-lg border border-primary-200">
                  <span className="text-sm text-gray-600">Logged in as:</span>
                  <span className="text-sm font-semibold text-primary-700 ml-1">{currentUser.username}</span>
                </div>
              )}
              <button className="btn" onClick={onHome}>Home</button>
            </div>
          </div>
        </div>
        {currentUser ? (
          <>
            <div className="mt-6">
              <CardGrid cards={collection.cards || []} onTrade={canTrade ? onTrade : null} />
            </div>
            {isOwner && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-800 font-medium">This is your collection. You cannot trade with yourself.</p>
              </div>
            )}
            {!isOwner && canTrade && (
              <div className="mt-4 bg-accent-50 border border-accent-200 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-700"><span className="inline-flex items-center gap-2 justify-center"><span className="inline-block w-2 h-2 rounded-full bg-primary-500"></span><span className="font-semibold">Trade</span> a card to make an offer.</span></p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 bg-white rounded-xl shadow-card border border-gray-200 p-8 text-center">
            <p className="text-gray-600 inline-flex items-center gap-2 justify-center">
              <span className="inline-block w-3 h-3 rounded-full bg-gray-500"></span>
              Please log in to view and trade this collection.
            </p>
          </div>
        )}
      </div>
      {showTrade && canTrade && (
        <TradeModal targetCard={showTrade} currentUser={currentUser} onClose={() => setShowTrade(null)} onCreated={() => { setShowTrade(null); }} />
      )}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card max-w-md w-full animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Trade Access</h2>
            <p className="text-gray-600 text-sm mb-4">Login or create an account to view collections</p>
            <div className="flex gap-2 mt-3">
              <button
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${authMode === 'login' ? 'bg-primary-500 text-white shadow-card' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => { setAuthMode('login'); setLoginError(''); }}
              >
                Login
              </button>
              <button
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${authMode === 'signup' ? 'bg-primary-500 text-white shadow-card' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => { setAuthMode('signup'); setLoginError(''); }}
              >
                Sign Up
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4 mt-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Your Profile:</label>
                  <div className="grid grid-cols-4 gap-3">
                    {PROFILE_PICS.map(pic => (
                      <button
                        key={pic.name}
                        type="button"
                        onClick={() => setLoginProfilePic(pic.name)}
                        className={`flex flex-col items-center transition-transform ${
                          loginProfilePic === pic.name ? 'scale-110' : 'hover:scale-105'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-full overflow-hidden border-4 ${
                          loginProfilePic === pic.name ? 'border-pokeblue' : 'border-gray-300'
                        }`}>
                          <img src={pic.img} alt={pic.label} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs mt-1 font-medium">{pic.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <input className="w-full border rounded p-2" placeholder="Enter your username" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
              {loginError && <div className="text-red-600 text-sm">{loginError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-yellow" onClick={() => { setShowLogin(false); setLoginError(''); }}>Cancel</button>
                <button className="btn" type="submit">{authMode === 'signup' ? 'Create Account' : 'Login'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
