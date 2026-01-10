import React, { useState } from 'react';
import { apiUrl } from '../api.js';

const PROFILE_PICS = [
  { name: 'eevee', label: 'Eevee', img: '/profiles/eevee.png' },
  { name: 'squirtle', label: 'Squirtle', img: '/profiles/squirtle.png' },
  { name: 'charmander', label: 'Charmander', img: '/profiles/charmander.png' },
  { name: 'bulbasaur', label: 'Bulbasaur', img: '/profiles/bulbasaur.png' }
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState('login');
  const [profilePic, setProfilePic] = useState('eevee');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    const uname = username.trim().toLowerCase();
    if (!uname) { setError('Please enter a username'); return; }
    try {
      const payload = mode === 'signup' ? { username: uname, profilePic } : { username: uname };
      const endpoint = mode === 'signup' ? '/api/users/signup' : '/api/users/login';
      const res = await fetch(apiUrl(endpoint), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }
      if (res.ok) {
        onLogin(data.user);
      } else if (mode === 'signup' && res.status === 409) {
        setError('Username already taken');
      } else if (mode === 'login' && res.status === 404) {
        setError('Username not found. Please sign up.');
      } else {
        setError(data.error || `Request failed (${res.status})`);
      }
    } catch {
      setError('Network error');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full shadow-hover animate-slide-up">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">Pokémon Trading</h1>
          <p className="text-gray-600 text-sm">Collect, trade, and showcase your cards</p>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${mode === 'login' ? 'bg-primary-500 text-white shadow-card' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Login
          </button>
          <button
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${mode === 'signup' ? 'bg-primary-500 text-white shadow-card' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Sign Up
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Your Profile:</label>
              <div className="grid grid-cols-4 gap-3">
                {PROFILE_PICS.map(pic => (
                  <button
                    key={pic.name}
                    type="button"
                    onClick={() => setProfilePic(pic.name)}
                    className={`flex flex-col items-center transition-all duration-200 ${
                      profilePic === pic.name ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <div className={`w-20 h-20 rounded-full overflow-hidden border-4 transition-all ${
                      profilePic === pic.name ? 'border-primary-500 shadow-card ring-2 ring-primary-200' : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <img src={pic.img} alt={pic.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs mt-1 font-medium text-gray-700">{pic.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <input 
            className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none" 
            placeholder="Enter username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
          />
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <button className="btn w-full text-base py-3" type="submit">
            {mode === 'signup' ? 'Create Account' : 'Login'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-4 text-center bg-gray-50 px-3 py-2 rounded-lg">
          🔓 No password needed—just pick a unique username
        </p>
      </div>
    </div>
  );
}
