import React, { useEffect, useState } from 'react';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Share from './pages/Share.jsx';

function Footer() {
  return (
    <div className="fixed bottom-4 right-4 bg-white/90 text-gray-700 text-xs sm:text-sm px-3 py-1 rounded-lg shadow-soft border border-gray-200 backdrop-blur">
      © 2026 Charmaine — All rights reserved
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  if (route.startsWith('/share/')) {
    const username = route.replace('/share/', '').trim().toLowerCase();
    return (
      <>
        <Share username={username} currentUser={currentUser} onHome={() => { 
          // Clear share viewer user when going home
          localStorage.removeItem('shareViewerUser'); 
          navigate('/'); 
        }} />
        <Footer />
      </>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Login onLogin={(u) => { setCurrentUser(u); localStorage.setItem('currentUser', JSON.stringify(u)); navigate('/'); }} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Dashboard currentUser={currentUser} onLogout={() => { localStorage.removeItem('currentUser'); setCurrentUser(null); }} onNavigate={navigate} />
      <Footer />
    </>
  );
}
