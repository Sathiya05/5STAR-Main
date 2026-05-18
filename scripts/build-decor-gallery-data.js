/**
 * Scans assets/images and writes decor-gallery-data.json with correct paths.
 * Run: node scripts/build-decor-gallery-data.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'assets', 'images');
const OUT_FILE = path.join(ROOT, 'decor-gallery-data.json');

const CATEGORIES = [
  { id: 'wedding-backdrops', title: 'Wedding Backdrops', prefix: 'Wedding-Backdrops_' },
  { id: 'mandap-decoration', title: 'Mandap Decoration', prefix: 'Mandap-Decoration_' },
  { id: 'photo-booth-decoration', title: 'Photo Booth Decoration', prefix: 'Photo-Booth-Decoration_' },
  { id: 'haldi-and-mehendi', title: 'Haldi and Mehendi', prefix: 'Haldi-and-Mehendi_' },
  { id: 'party-decorations', title: 'Party Decoration', prefix: 'Party-Decorations_' },
  { id: 'house-decoration', title: 'House Decoration', prefix: 'House-Decoration_' },
  { id: 'naming-cermony', title: 'Naming Cermony', prefix: 'Naming-cermony_' },
  { id: 'corporate-event-decor', title: 'Corporate Event Decor', prefix: 'Corporate-event-Decor_' },
  { id: 'floral-sculptures', title: 'Floral Sculptures', prefix: 'Floral-Sculptures_' },
  { id: 'sangeet', title: 'Sangeet', prefix: 'Sangeet_' },
  { id: 'other-decors', title: 'Other Decors', prefix: 'Other-Decors_' },
  { id: 'special-lighting', title: 'Special Lighting', prefix: 'Special-Lighting_' },
  {
    id: 'birthday-decor',
    title: 'Birthday Decor',
    prefix: 'Birthday-Decor_',
  },
];

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

function imageUrl(filename) {
  return `assets/images/${filename}`;
}

function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('Missing folder:', IMAGES_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR).filter((f) => IMAGE_EXT.test(f));
  const used = new Set();

  const sections = CATEGORIES.map((cat) => {
    const images = files
      .filter((f) => {
        const match = f.startsWith(cat.prefix) || (cat.extra && cat.extra.includes(f));
        if (match) used.add(f);
        return match;
      })
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map(imageUrl);

    return { title: cat.title, images, id: cat.id };
  }).filter((s) => s.images.length > 0);

  const unused = files.filter((f) => !used.has(f));
  if (unused.length) {
    console.warn('Unassigned images (%d):', unused.length, unused.slice(0, 5).join(', '), unused.length > 5 ? '...' : '');
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(sections, null, 4) + '\n');
  const total = sections.reduce((n, s) => n + s.images.length, 0);
  console.log(`Wrote ${OUT_FILE}: ${sections.length} categories, ${total} images`);
}

main();
