#!/usr/bin/env node
/**
 * Script de création d'un compte administrateur
 * Usage: node scripts/create-admin.mjs <email> <password> [display_name]
 */

import { createHash } from 'node:crypto'
import { argv } from 'node:process'

// Fonction simplifiée de hashage (compatible avec AdonisJS hash.make)
function hashPassword(password) {
  // Pour la production, AdonisJS utilise bcrypt/argon2
  // Ici on utilise un hash simple pour la démo (à remplacer en production)
  const salt = 'luka_tribunal_2026'
  return createHash('sha256').update(password + salt).digest('hex')
}

function showUsage() {
  console.log(`
📋 Création d'un compte administrateur LUKA TRIBUNAL

Usage:
  node scripts/create-admin.mjs <email> <password> [display_name]

Arguments:
  email         Email de l'administrateur (unique)
  password      Mot de passe (minimum 12 caractères)
  display_name  Nom d'affichage (optionnel)

Exemples:
  node scripts/create-admin.mjs admin@example.com "MotDePasse123!" "Admin Principal"
  node scripts/create-admin.mjs test@luka.cd "TestPassword2026!"

⚠️  IMPORTANT:
  - Le mot de passe doit faire minimum 12 caractères
  - L'email doit être valide et unique
  - Ne jamais committer les mots de passe dans Git
`)
  process.exit(1)
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

function main() {
  const [,, email, password, displayName] = argv

  if (!email || !password) {
    showUsage()
  }

  // Validations
  if (!validateEmail(email)) {
    console.error('❌ Email invalide:', email)
    process.exit(1)
  }

  if (password.length < 12) {
    console.error('❌ Le mot de passe doit faire minimum 12 caractères')
    console.error(`   Longueur actuelle: ${password.length} caractères`)
    process.exit(1)
  }

  const finalDisplayName = displayName || 'Administrateur'
  const passwordHash = hashPassword(password)

  console.log('\n═══════════════════════════════════════════════════')
  console.log('  Création de compte administrateur')
  console.log('═══════════════════════════════════════════════════\n')
  console.log(`📧 Email:        ${email}`)
  console.log(`👤 Nom:          ${finalDisplayName}`)
  console.log(`🔒 Hash:         ${passwordHash.substring(0, 16)}...`)
  console.log('\n📋 Requête SQL à exécuter:\n')

  const sql = `
INSERT INTO admin_users (email, password_hash, display_name, role, is_active)
VALUES (
  '${email}',
  '${passwordHash}',
  '${finalDisplayName}',
  'administrator',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  display_name = EXCLUDED.display_name,
  updated_at = now()
RETURNING id, email, display_name, role, is_active, created_at;
`.trim()

  console.log(sql)

  console.log('\n\n💾 Pour exécuter sur la base de preview:')
  console.log('─────────────────────────────────────────────────')
  console.log(`docker exec -i luka-preview-postgres-1 psql -U luka_user -d luka_preview <<EOF`)
  console.log(sql)
  console.log(`EOF`)

  console.log('\n\n✅ Une fois exécuté, connectez-vous à http://localhost:3000/administration')
  console.log(`   Email: ${email}`)
  console.log(`   Mot de passe: [le mot de passe que vous avez fourni]\n`)
}

main()
