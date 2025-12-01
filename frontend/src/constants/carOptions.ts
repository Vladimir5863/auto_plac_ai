export const CAR_BRANDS: Record<string, string[]> = {
  Audi: ['A1', 'A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
  BMW: ['1', '2', '3', '4', '5', 'X1', 'X3', 'X5'],
  Mercedes: ['A 180', 'C 200', 'E 220', 'GLA', 'GLC', 'S 350'],
  Volkswagen: ['Golf', 'Passat', 'Tiguan', 'Arteon', 'Polo'],
  Toyota: ['Auris', 'Corolla', 'RAV4', 'Camry', 'Yaris'],
  Hyundai: ['i20', 'i30', 'Tucson', 'Kona', 'Santa Fe'],
  Skoda: ['Fabia', 'Octavia', 'Superb', 'Karoq', 'Kodiaq'],
  Peugeot: ['208', '308', '3008', '2008', '508'],
  Ford: ['Fiesta', 'Focus', 'Kuga', 'Mondeo', 'Puma'],
  Renault: ['Clio', 'Megane', 'Kadjar', 'Captur', 'Talisman'],
};

export const BRAND_OPTIONS = Object.keys(CAR_BRANDS);

export const BODY_TYPE_OPTIONS = [
  'Limuzina',
  'Hecbek',
  'Karavan',
  'SUV',
  'Kupe',
  'Kabriolet',
  'Pickup',
  'Kombi',
];

export const TRANSMISSION_OPTIONS = ['Manuelni', 'Automatski', 'Poluautomatski'];

export const EURO_NORM_OPTIONS = ['Euro 1', 'Euro 2', 'Euro 3', 'Euro 4', 'Euro 5', 'Euro 6'];

export const STANJE_OPTIONS = ['Novo', 'Polovno', 'Neispravno'];

export const CLIMATE_FILTER_OPTIONS = [
  { label: 'Sve opcije', value: '' },
  { label: 'Ima klimu', value: 'ima' },
  { label: 'Nema klimu', value: 'nema' },
];

export const CLIMATE_FORM_OPTIONS = [
  { label: 'Ima klimu', value: 'Ima klimu' },
  { label: 'Nema klimu', value: 'Nema klimu' },
];

export const FUEL_OPTIONS = ['Benzin', 'Dizel', 'Plin', 'Struja', 'Hibrid'];
