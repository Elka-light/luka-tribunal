#!/usr/bin/env node
/**
 * Script de géolocalisation des tribunaux pour enfants
 * Utilise Nominatim (OpenStreetMap) pour obtenir les coordonnées GPS
 */

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

// Configuration Nominatim
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'LUKA-TRIBUNAL/0.1.0 (RDC Children Courts Locator)'
const DELAY_MS = 1500 // Respect de la politique Nominatim : max 1 req/sec

/**
 * Attendre un délai
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Géolocaliser une adresse via Nominatim
 */
async function geocodeAddress(tribunal) {
  const query = `${tribunal.adresse}, ${tribunal.ville}, ${tribunal.province}, ${tribunal.pays}`

  console.log(`\n🔍 Géolocalisation: ${tribunal.nom}`)
  console.log(`   Requête: ${query}`)

  try {
    const url = new URL(NOMINATIM_URL)
    url.searchParams.set('q', query)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')
    url.searchParams.set('countrycodes', 'cd') // RDC uniquement
    url.searchParams.set('addressdetails', '1')

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const results = await response.json()

    if (results.length === 0) {
      // Fallback: essayer avec ville uniquement
      console.log(`   ⚠️  Aucun résultat, essai avec la ville seule...`)
      const fallbackQuery = `${tribunal.ville}, ${tribunal.pays}`
      url.searchParams.set('q', fallbackQuery)

      const fallbackResponse = await fetch(url.toString(), {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
      })

      const fallbackResults = await fallbackResponse.json()

      if (fallbackResults.length > 0) {
        const result = fallbackResults[0]
        console.log(`   ✓ Coordonnées approximatives (centre-ville)`)
        console.log(`   Latitude: ${result.lat}`)
        console.log(`   Longitude: ${result.lon}`)
        return {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          precision: 'city_center',
          display_name: result.display_name,
        }
      }

      console.log(`   ❌ Impossible de géolocaliser`)
      return null
    }

    const result = results[0]
    console.log(`   ✓ Géolocalisé avec succès`)
    console.log(`   Latitude: ${result.lat}`)
    console.log(`   Longitude: ${result.lon}`)

    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      precision: 'address',
      display_name: result.display_name,
    }
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`)
    return null
  }
}

/**
 * Script principal
 */
async function main() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  Géolocalisation des Tribunaux pour Enfants - RDC')
  console.log('═══════════════════════════════════════════════════\n')

  // Charger les tribunaux
  const inputPath = join(PROJECT_ROOT, 'data', 'tribunaux_a_geolocaliser.json')
  const tribunaux = JSON.parse(await readFile(inputPath, 'utf-8'))

  console.log(`📋 ${tribunaux.length} tribunaux à géolocaliser\n`)
  console.log('⏱️  Délai entre requêtes: ${DELAY_MS}ms (respect Nominatim)\n')

  const results = []

  for (const [index, tribunal] of tribunaux.entries()) {
    console.log(`\n[${index + 1}/${tribunaux.length}] ────────────────────────────`)

    const geocode = await geocodeAddress(tribunal)

    results.push({
      ...tribunal,
      geocode: geocode || {
        lat: null,
        lon: null,
        precision: 'failed',
        display_name: null,
      },
    })

    // Respecter le délai entre requêtes (sauf pour le dernier)
    if (index < tribunaux.length - 1) {
      await delay(DELAY_MS)
    }
  }

  // Sauvegarder les résultats
  const outputPath = join(PROJECT_ROOT, 'data', 'tribunaux_geolocalises.json')
  await writeFile(outputPath, JSON.stringify(results, null, 2), 'utf-8')

  console.log('\n\n═══════════════════════════════════════════════════')
  console.log('  Résultats de la géolocalisation')
  console.log('═══════════════════════════════════════════════════\n')

  const success = results.filter((r) => r.geocode.lat !== null).length
  const failed = results.length - success

  console.log(`✅ Géolocalisés: ${success}/${results.length}`)
  console.log(`❌ Échecs: ${failed}/${results.length}`)
  console.log(`\n📁 Fichier de sortie: ${outputPath}\n`)

  if (failed > 0) {
    console.log('⚠️  Tribunaux non géolocalisés:')
    results
      .filter((r) => r.geocode.lat === null)
      .forEach((r) => console.log(`   - ${r.nom} (${r.ville})`))
    console.log()
  }
}

main().catch((error) => {
  console.error('\n❌ Erreur fatale:', error)
  process.exit(1)
})
