const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const env = require('../../config/env');

const SALT_ROUNDS = 10;

// Yeni şirket + ilk admin kullanıcıyı tek bir transaction içinde oluşturur.
// İkisi birbirine bağlı olduğu için ya ikisi de başarılı olmalı ya da hiçbiri (atomicity).
async function registerCompanyWithAdmin({ companyName, companySlug, email, password }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const companyResult = await client.query(
      'INSERT INTO companies (name, slug) VALUES ($1, $2) RETURNING id, name, slug',
      [companyName, companySlug]
    );
    const company = companyResult.rows[0];

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userResult = await client.query(
      `INSERT INTO users (company_id, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, email, role, company_id`,
      [company.id, email, passwordHash]
    );
    const user = userResult.rows[0];

    await client.query('COMMIT');

    return { company, user };
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      const conflictErr = new Error(
        err.constraint === 'companies_slug_unique'
          ? 'Bu company slug zaten kullanılıyor'
          : 'Bu kayit zaten mevcut'
      );
      conflictErr.status = 409;
      throw conflictErr;
    }
    throw err;
  } finally {
    client.release();
  }
}

async function findUserByCompanySlugAndEmail(companySlug, email) {
  const result = await pool.query(
    `SELECT u.id, u.company_id, u.email, u.password_hash, u.role, c.slug AS company_slug
     FROM users u
     INNER JOIN companies c ON c.id = u.company_id
     WHERE c.slug = $1 AND u.email = $2
     LIMIT 1`,
    [companySlug, email]
  );
  return result.rows[0];
}

async function login({ companySlug, email, password }) {
  const user = await findUserByCompanySlugAndEmail(companySlug, email);

  if (!user) {
    const err = new Error('Email veya şifre hatalı');
    err.status = 401;
    throw err;
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    const err = new Error('Email veya şifre hatalı');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { userId: user.id, companyId: user.company_id, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company_id,
      companySlug: user.company_slug,
    },
  };
}

module.exports = { registerCompanyWithAdmin, login };
