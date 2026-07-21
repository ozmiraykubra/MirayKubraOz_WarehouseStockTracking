require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Eksik environment variable: ${key}. .env dosyanızı kontrol edin (.env.example'a bakın).`);
  }
});

module.exports = {
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
};
