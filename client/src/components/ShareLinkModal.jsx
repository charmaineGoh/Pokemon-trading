import React, { useEffect, useState } from 'react';

export default function ShareLinkModal({ username, onClose }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const origin = window.location.origin;
    setUrl(`${origin}/share/${username}`);
  }, [username]);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function openLink() {
    window.open(url, '_blank');
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="card max-w-lg w-full">
        <h2 className="text-xl font-bold text-pokeblue">Share Your Collection</h2>
        <p className="text-sm text-gray-700 mt-2">Send this link to friends so they can view your collection and offer trades.</p>
        <div className="mt-3">
          <input className="w-full border rounded p-2" value={url} readOnly />
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button className="btn-yellow" onClick={onClose}>Close</button>
          <button className="btn" onClick={copyUrl}>{copied ? 'Copied!' : 'Copy Link'}</button>
          <button className="btn" onClick={openLink}>Open</button>
        </div>
      </div>
    </div>
  );
}
