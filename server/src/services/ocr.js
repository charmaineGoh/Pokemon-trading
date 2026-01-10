import path from 'path';

// Optional lightweight name extraction from image path or OCR stub.
// Tries to read the base filename as the card name; falls back to 'Unknown Card'.
// You can later integrate tesseract.js or a cloud OCR for better accuracy.

const POKEMON_NAMES = [
  'Pikachu','Charizard','Bulbasaur','Squirtle','Eevee','Mewtwo','Gengar','Snorlax','Jigglypuff','Lucario','Greninja','Rayquaza','Dragonite','Arceus','Gardevoir','Umbreon','Sylveon','Blastoise','Venusaur','Raichu'
];

export async function extractCardNameFromImage(imagePath) {
  try {
    const base = path.basename(imagePath).toLowerCase();
    const nameGuess = base.replace(/[-_]/g, ' ').replace(/\.[a-zA-Z0-9]+$/, '').trim();
    const match = POKEMON_NAMES.find(n => nameGuess.includes(n.toLowerCase()));
    if (match) return match;
    // Fallback: title-case first token if any
    const token = nameGuess.split(' ').find(Boolean);
    if (token && token.length > 2) return token.charAt(0).toUpperCase() + token.slice(1);
    return 'Unknown Card';
  } catch (e) {
    return 'Unknown Card';
  }
}
