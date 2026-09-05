import fs from 'node:fs';
import path from 'node:path';

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error('Usage: node scripts/build-lake-catalog.mjs <official.csv>');

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && text[i + 1] === '"' && quoted) { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell.trim()); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell.trim()); cell = '';
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows;
}

const slugify = (value) => value
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const knownMatchers = [
  { test: /venkojirao.*agara/i, status: 'report_in_progress', coordinates: [77.6387, 12.9121], aliases: ['Agara Lake'] },
  { test: /kaigondanahalli/i, status: 'report_in_progress', coordinates: [77.6807, 12.9113], aliases: ['Kaikondrahalli Lake'] },
  { test: /sankey lake/i, status: 'report_in_progress', coordinates: [77.5704, 13.0102], aliases: ['Sankey Tank'] },
  { test: /^jakkur lake$/i, status: 'report_in_progress', coordinates: [77.6117, 13.0848], aliases: ['Jakkur Kere'] },
  { test: /ulsoor/i, status: 'report_in_progress', coordinates: [77.6196, 12.9819], aliases: ['Halasuru Lake'] },
];

const authorityEntries = [
  ['Bellanduru Lake', 'BDA', 'Bengaluru East & South', [77.6669, 12.9372]],
  ['Varthur Lake', 'BDA', 'Bengaluru East', [77.7418, 12.9561]],
  ['Ramasandra Lake', 'BDA', 'Bengaluru South'],
  ['Kommaghatta Lake', 'BDA', 'Bengaluru South'],
  ['Chikkabanavara Lake', 'BDA', 'Bengaluru North'],
  ['Madivala Lake', 'KFD', 'Bengaluru East & South', [77.6177, 12.9141]],
  ['Puttenahalli Lake', 'KFD', 'Bengaluru North', [77.5857, 12.8911]],
  ['Hebbala Lake', 'KFD', 'Bengaluru North', [77.5868, 13.0466]],
  ['Nagavara Lake', 'KFD', 'Bengaluru North'],
  ['Veerasandra Lake', 'BMRCL', 'Anekal Taluk'],
];

const rows = parseCsv(fs.readFileSync(sourcePath, 'utf8')).slice(1);
const seen = new Map();
const exactSeen = new Set();
const entries = [];

for (const [serial, ward, constituency, rawName] of rows) {
  if (!rawName) continue;
  const exactKey = `${rawName.replace(/\s+/g, ' ').trim().toLowerCase()}|${ward.replace(/\s+/g, ' ').trim().toLowerCase()}`;
  if (exactSeen.has(exactKey)) continue;
  exactSeen.add(exactKey);
  let slug = slugify(rawName);
  const duplicate = seen.get(slug) ?? 0;
  seen.set(slug, duplicate + 1);
  if (duplicate) slug = `${slug}-${duplicate + 1}`;
  const override = knownMatchers.find((item) => item.test.test(rawName.replace(/\s+/g, ' ').trim())) ?? {};
  entries.push({
    id: `blr-lake-${String(entries.length + 1).padStart(3, '0')}`,
    slug,
    name: rawName.replace(/\s+/g, ' ').trim(),
    aliases: override.aliases ?? [],
    custodian: 'BBMP',
    zone: constituency || 'Not listed',
    ward: ward || 'Not listed',
    administrativeArea: 'Bengaluru Urban',
    status: override.status ?? 'not_field_checked',
    ...(override.coordinates ? { coordinates: override.coordinates } : {}),
    source: {
      url: 'https://data.opencity.in/dataset/bengaluru-lakes-and-their-maintainers',
      publishedAt: '2024-01-01',
      retrievedAt: '2026-09-05',
      sourceSerial: serial || null
    }
  });
}

for (const [name, custodian, zone, coordinates] of authorityEntries) {
  const slug = slugify(name);
  entries.push({
    id: `blr-lake-${String(entries.length + 1).padStart(3, '0')}`,
    slug,
    name,
    aliases: [],
    custodian,
    zone,
    ward: 'Not listed',
    administrativeArea: 'Bengaluru Urban',
    status: 'not_field_checked',
    ...(coordinates ? { coordinates } : {}),
    source: {
      url: 'https://data.opencity.in/dataset/bengaluru-lakes-and-their-maintainers',
      publishedAt: '2024-01-01',
      retrievedAt: '2026-09-05',
      sourceSerial: null
    }
  });
}

if (entries.length !== 210) throw new Error(`Expected 210 entries, found ${entries.length}`);
const output = path.resolve('src/data/lakes.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`Wrote ${entries.length} lake entries to ${output}`);
