const prisma = require('../models/index');

// sample data here

const categoryDate = [
  {
    categoryId: 1,
    categoryName: 'Caring',
    subCatId: 11,
    subCatName: 'Child Care',
  },
  {
    categoryId: 1,
    categoryName: 'Caring',
    subCatId: 12,
    subCatName: 'Elderly Care',
  },
  {
    categoryId: 2,
    categoryName: 'Cleaning',
    subCatId: 21,
    subCatName: 'General Cleaning',
  },
  {
    categoryId: 2,
    categoryName: 'Cleaning',
    subCatId: 22,
    subCatName: 'A/C Cleaning',
  },
  {
    categoryId: 2,
    categoryName: 'Cleaning',
    subCatId: 23,
    subCatName: 'Car Cleaning',
  },
  {
    categoryId: 2,
    categoryName: 'Cleaning',
    subCatId: 24,
    subCatName: 'Washing Machine Cleaning',
  },
  {
    categoryId: 2,
    categoryName: 'Cleaning',
    subCatId: 25,
    subCatName: 'Water Tank Cleaning',
  },
  {
    categoryId: 2,
    categoryName: 'Cleaning',
    subCatId: 26,
    subCatName: 'Niche Cleaning',
  },
  {
    categoryId: 3,
    categoryName: 'Laundry',
    subCatId: 31,
    subCatName: 'General Laundry',
  },
  {
    categoryId: 3,
    categoryName: 'Laundry',
    subCatId: 32,
    subCatName: 'Bedding Laundry',
  },
  {
    categoryId: 4,
    categoryName: 'Transport',
    subCatId: 41,
    subCatName: 'General Transport',
  },
  {
    categoryId: 5,
    categoryName: 'Repair',
    subCatId: 51,
    subCatName: 'Plumbing',
  },
  {
    categoryId: 5,
    categoryName: 'Repair',
    subCatId: 52,
    subCatName: 'Electrician',
  },
  {
    categoryId: 5,
    categoryName: 'Repair',
    subCatId: 53,
    subCatName: 'HVAC',
  },
  {
    categoryId: 5,
    categoryName: 'Repair',
    subCatId: 54,
    subCatName: 'Construction',
  },
  {
    categoryId: 5,
    categoryName: 'Repair',
    subCatId: 55,
    subCatName: 'Painting',
  },
  {
    categoryId: 5,
    categoryName: 'Repair',
    subCatId: 56,
    subCatName: 'Woodwork',
  },
  {
    categoryId: 5,
    categoryName: 'Repair',
    subCatId: 57,
    subCatName: 'Roofing',
  },
  {
    categoryId: 6,
    categoryName: 'Pet Care',
    subCatId: 61,
    subCatName: 'Pet Boarding',
  },
  {
    categoryId: 6,
    categoryName: 'Pet Care',
    subCatId: 62,
    subCatName: 'Pet Grooming',
  },
  {
    categoryId: 7,
    categoryName: 'Gardening',
    subCatId: 71,
    subCatName: 'Tree Services',
  },
  {
    categoryId: 7,
    categoryName: 'Gardening',
    subCatId: 72,
    subCatName: 'General Gardening',
  },
];

async function seedDatabase() {
  // prisma command here
}

console.log('Seeding Database...');
seedDatabase();
