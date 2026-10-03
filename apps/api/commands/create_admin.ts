import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'

export default class CreateAdmin extends BaseCommand {
  static commandName = 'create:admin'
  static description = 'Créer un compte administrateur'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Email de l\'administrateur' })
  declare email: string

  @args.string({ description: 'Mot de passe (min 12 caractères)' })
  declare password: string

  @flags.string({ description: 'Nom d\'affichage' })
  declare displayName?: string

  async run() {
    this.logger.info('Création d\'un compte administrateur...')

    // Validations
    if (this.password.length < 12) {
      this.logger.error('Le mot de passe doit faire minimum 12 caractères')
      this.exitCode = 1
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(this.email)) {
      this.logger.error('Email invalide')
      this.exitCode = 1
      return
    }

    // Vérifier si l'email existe déjà
    const existing = await db.from('admin_users').where('email', this.email).first()

    if (existing) {
      this.logger.warning(`L'email ${this.email} existe déjà`)
      const confirm = await this.prompt.confirm('Voulez-vous mettre à jour le mot de passe ?')

      if (!confirm) {
        this.logger.info('Opération annulée')
        return
      }

      // Mise à jour
      await db
        .from('admin_users')
        .where('email', this.email)
        .update({
          password_hash: await hash.make(this.password),
          updated_at: new Date(),
        })

      this.logger.success(`Mot de passe mis à jour pour ${this.email}`)
    } else {
      // Création
      const [admin] = await db
        .table('admin_users')
        .insert({
          email: this.email,
          password_hash: await hash.make(this.password),
          display_name: this.displayName || 'Administrateur',
          role: 'administrator',
          is_active: true,
        })
        .returning(['id', 'email', 'display_name'])

      this.logger.success('✅ Compte administrateur créé avec succès')
      this.logger.info(`📧 Email: ${admin.email}`)
      this.logger.info(`👤 Nom: ${admin.display_name}`)
      this.logger.info(`🆔 ID: ${admin.id}`)
    }

    this.logger.info('\n🌐 Connectez-vous à: http://localhost:3000/administration')
  }
}
