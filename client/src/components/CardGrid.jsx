import React from 'react';

export default function CardGrid({ cards, onTrade }) {
  return (
    <div className="grid-cards">
      {cards.map(card => (
        <div key={card.id} className="card group hover:scale-[1.02] transition-transform duration-300">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-full object-cover rounded-lg"
              style={{ aspectRatio: '63 / 88' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="font-bold text-gray-900 text-lg truncate">{card.name}</div>
            <div className="flex items-center justify-between">
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-semibold">
                ${Number(card.price).toFixed(2)}
              </div>
              <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                Condition {card.condition}/10
              </div>
            </div>
          </div>
          {onTrade && <button className="btn-yellow mt-3 w-full" onClick={() => onTrade(card)}>Trade</button>}
        </div>
      ))}
    </div>
  );
}
