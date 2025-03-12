const prisma = require('../models/index');

async function resetDatabase() {
  const tableNames = Object.keys(prisma).filter((key) => !key.startsWith('$') && !key.startsWith('_'));
  console.log(tableNames);

  // async/await only use for...of
  for (let table of tableNames) {
    console.log(`Reset data and auto-increment: ${table}`);
    await prisma[table].deleteMany();
    await prisma.$executeRawUnsafe(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
  }
}

console.log('Resetting Database...');
resetDatabase();
