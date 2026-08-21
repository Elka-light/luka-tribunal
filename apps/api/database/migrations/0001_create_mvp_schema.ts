import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS postgis')
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS pgcrypto')
    await this.db.rawQuery(`
      CREATE TYPE jurisdiction_status AS ENUM ('draft', 'pending_verification', 'published');
      CREATE TYPE report_category AS ENUM ('incorrect_address', 'incorrect_coordinates', 'incorrect_contact', 'closed_or_moved', 'other');
      CREATE TYPE report_status AS ENUM ('new', 'reviewing', 'resolved', 'rejected');

      CREATE TABLE admin_users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(320) NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        display_name varchar(120) NOT NULL,
        role varchar(30) NOT NULL DEFAULT 'administrator' CHECK (role = 'administrator'),
        is_active boolean NOT NULL DEFAULT true,
        last_login_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE jurisdictions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        slug varchar(160) NOT NULL UNIQUE,
        official_name varchar(200) NOT NULL,
        common_name varchar(200),
        jurisdiction_type varchar(80) NOT NULL,
        province varchar(120) NOT NULL,
        city varchar(120),
        municipality varchar(120),
        territory varchar(120),
        locality varchar(160),
        address varchar(500) NOT NULL,
        territorial_jurisdiction text,
        location geography(Point, 4326) NOT NULL,
        coordinate_precision_meters integer CHECK (coordinate_precision_meters IS NULL OR coordinate_precision_meters > 0),
        coordinate_source varchar(500) NOT NULL,
        information_source varchar(500) NOT NULL,
        collected_at date,
        verified_at date,
        status jurisdiction_status NOT NULL DEFAULT 'draft',
        published_at timestamptz,
        created_by uuid REFERENCES admin_users(id),
        updated_by uuid REFERENCES admin_users(id),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        archived_at timestamptz,
        CONSTRAINT jurisdictions_publication_fields CHECK (
          status <> 'published' OR (
            verified_at IS NOT NULL AND published_at IS NOT NULL AND
            length(trim(information_source)) > 0 AND length(trim(coordinate_source)) > 0 AND archived_at IS NULL
          )
        ),
        CONSTRAINT jurisdictions_not_null_island CHECK (
          NOT (ST_X(location::geometry) = 0 AND ST_Y(location::geometry) = 0)
        )
      );

      CREATE INDEX jurisdictions_status_idx ON jurisdictions (status);
      CREATE INDEX jurisdictions_province_idx ON jurisdictions (province);
      CREATE INDEX jurisdictions_city_idx ON jurisdictions (city);
      CREATE INDEX jurisdictions_location_gist ON jurisdictions USING GIST (location);

      CREATE TABLE jurisdiction_contacts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
        type varchar(30) NOT NULL CHECK (type IN ('phone', 'email', 'website')),
        label varchar(100),
        value varchar(320) NOT NULL,
        is_public boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE reports (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id),
        category report_category NOT NULL,
        comment varchar(1000),
        status report_status NOT NULL DEFAULT 'new',
        handled_by uuid REFERENCES admin_users(id),
        handled_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT reports_handling_consistency CHECK (
          (handled_at IS NULL AND handled_by IS NULL) OR (handled_at IS NOT NULL AND handled_by IS NOT NULL)
        )
      );

      CREATE INDEX reports_status_created_at_idx ON reports (status, created_at);

      CREATE TABLE audit_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_id uuid NOT NULL REFERENCES admin_users(id),
        action varchar(80) NOT NULL,
        entity_type varchar(50) NOT NULL,
        entity_id uuid NOT NULL,
        metadata jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX audit_logs_entity_idx ON audit_logs (entity_type, entity_id);
      CREATE INDEX audit_logs_actor_created_at_idx ON audit_logs (actor_id, created_at);
    `)
  }

  async down() {
    await this.db.rawQuery(`
      DROP TABLE IF EXISTS audit_logs;
      DROP TABLE IF EXISTS reports;
      DROP TABLE IF EXISTS jurisdiction_contacts;
      DROP TABLE IF EXISTS jurisdictions;
      DROP TABLE IF EXISTS admin_users;
      DROP TYPE IF EXISTS report_status;
      DROP TYPE IF EXISTS report_category;
      DROP TYPE IF EXISTS jurisdiction_status;
    `)

    // Extensions retained because other database schemas may depend on them.
  }
}
