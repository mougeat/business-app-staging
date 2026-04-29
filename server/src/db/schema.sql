CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'sales', 'purchasing', 'readonly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE comm_type AS ENUM ('meeting', 'phone_call', 'email', 'whatsapp', 'sms', 'note');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS tenants (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(200) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    role          user_role NOT NULL DEFAULT 'sales',
    is_active     BOOLEAN DEFAULT TRUE,
    last_login    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    industry    VARCHAR(100),
    website     VARCHAR(255),
    address     TEXT,
    city        VARCHAR(100),
    country     VARCHAR(100),
    notes       TEXT,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100),
    role        VARCHAR(100),
    email       VARCHAR(255),
    phone       VARCHAR(50),
    whatsapp    VARCHAR(50),
    notes       TEXT,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS communications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type        comm_type NOT NULL,
    subject     VARCHAR(255),
    body        TEXT,
    comm_date   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    company_id  UUID REFERENCES companies(id) ON DELETE CASCADE,
    contact_id  UUID REFERENCES contacts(id) ON DELETE CASCADE,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
-- Plusieurs contacts par communication
CREATE TABLE IF NOT EXISTS communication_contacts (
    communication_id  UUID NOT NULL REFERENCES communications(id) ON DELETE CASCADE,
    contact_id        UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    PRIMARY KEY (communication_id, contact_id)
);

-- Plusieurs liens par communication (projets, proposals, PO)
CREATE TABLE IF NOT EXISTS communication_links (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    communication_id  UUID NOT NULL REFERENCES communications(id) ON DELETE CASCADE,
    proposal_id       UUID REFERENCES proposals(id) ON DELETE CASCADE,
    po_id             UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    project_id        UUID REFERENCES projects(id) ON DELETE CASCADE
);

-- Ajouter next_action à communications
ALTER TABLE communications 
  ADD COLUMN IF NOT EXISTS next_action TEXT,
  ADD COLUMN IF NOT EXISTS next_action_date DATE,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;