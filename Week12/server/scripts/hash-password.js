import bcrypt from 'bcrypt';

const password = process.argv[2];

if (!password) {
  console.log('使用方式: node scripts/hash-password.js <password>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('密碼:', password);
console.log('Hash:', hash);