
export type Item = {
  id: string;
  title: string;
  price: number;
  image: string;
  hint: string;
  description: string;
  category: 'voucher' | 'food' | 'souvenir';
  createdAt: string; // ISO 8601 date string
};

export const items: Item[] = [
  {
    id: 'mango-jam',
    title: 'Sundowners Mango Jam',
    price: 5,
    image: 'https://placehold.co/300x300.png',
    hint: 'mango jam',
    description: 'Sweet and tangy mango jam made from fresh, locally sourced mangoes from Pangasinan. Perfect for toast, pastries, or as a glaze.',
    category: 'food',
    createdAt: '2024-05-15T10:00:00Z',
  },
  {
    id: 'coffee-voucher',
    title: 'Kape-tan Coffee Voucher',
    price: 8,
    image: 'https://placehold.co/300x300.png',
    hint: 'coffee voucher latte',
    description: 'Enjoy a free cup of locally sourced coffee from Kape-tan, a cozy cafe that supports local coffee growers.',
    category: 'voucher',
    createdAt: '2024-05-20T11:30:00Z',
  },
   {
    id: 'bamboo-straws',
    title: 'Eco-Friendly Bamboo Straws',
    price: 3,
    image: 'https://placehold.co/300x300.png',
    hint: 'bamboo straws',
    description: 'A set of 5 reusable bamboo straws, complete with a cleaning brush. A perfect, sustainable alternative to plastic.',
    category: 'souvenir',
    createdAt: '2024-05-18T09:00:00Z',
  },
   {
    id: 'local-keychain',
    title: 'Hand-woven Keychain',
    price: 2,
    image: 'https://placehold.co/300x300.png',
    hint: 'woven keychain',
    description: 'A beautiful, hand-woven keychain made by local artisans. A small piece of Pangasinan to take with you.',
    category: 'souvenir',
    createdAt: '2024-05-21T14:00:00Z',
  },
];
