import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      ALTER TYPE jurisdiction_status ADD VALUE IF NOT EXISTS 'pending_correction';
    `)
  }

  async down() {
    // PostgreSQL ne permet pas de supprimer directement une valeur d'un type ENUM.
    // Pour un retour arrière complet, il faudrait recréer le type sans cette valeur,
    // mais cela nécessite de supprimer toutes les colonnes qui l'utilisent.
    // Cette migration est donc à considérer comme non réversible sans intervention manuelle.
    await this.db.rawQuery(`
      -- Pour revenir en arrière, il faudrait :
      -- 1. S'assurer qu'aucune juridiction n'a le statut 'pending_correction'
      -- 2. Recréer le type sans cette valeur
      -- 3. Recréer toutes les colonnes qui utilisent ce type
      -- Cette opération nécessite une intervention manuelle pour éviter la perte de données.
      -- Consulter la documentation PostgreSQL sur la modification des types ENUM.
    `)
    // En pratique, si un retour arrière est nécessaire :
    // UPDATE jurisdictions SET status = 'draft' WHERE status = 'pending_correction';
    // Puis recréer manuellement le type ENUM sans 'pending_correction'
  }
}
