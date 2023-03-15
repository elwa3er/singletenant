CREATE SCHEMA IF NOT EXISTS auth_test AUTHORIZATION supabase_admin;

-- auth.users definition

CREATE TABLE auth_test.users (
	instance_id uuid NULL,
	id uuid NOT NULL UNIQUE,
	aud varchar(255) NULL,
	"role" varchar(255) NULL,
	email varchar(255) NULL UNIQUE,
	encrypted_password varchar(255) NULL,
	confirmed_at timestamptz NULL,
	invited_at timestamptz NULL,
	confirmation_token varchar(255) NULL,
	confirmation_sent_at timestamptz NULL,
	recovery_token varchar(255) NULL,
	recovery_sent_at timestamptz NULL,
	email_change_token varchar(255) NULL,
	email_change varchar(255) NULL,
	email_change_sent_at timestamptz NULL,
	last_sign_in_at timestamptz NULL,
	raw_app_meta_data jsonb NULL,
	raw_user_meta_data jsonb NULL,
	is_super_admin bool NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE INDEX users_instance_id_email_idx ON auth_test.users USING btree (instance_id, email);
CREATE INDEX users_instance_id_idx ON auth_test.users USING btree (instance_id);
comment on table auth_test.users is 'Auth: Stores user login data within a secure schema.';

-- auth.refresh_tokens definition

CREATE TABLE auth_test.refresh_tokens (
	instance_id uuid NULL,
	id bigserial NOT NULL,
	"token" varchar(255) NULL,
	user_id varchar(255) NULL,
	revoked bool NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id)
);
CREATE INDEX refresh_tokens_instance_id_idx ON auth_test.refresh_tokens USING btree (instance_id);
CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth_test.refresh_tokens USING btree (instance_id, user_id);
CREATE INDEX refresh_tokens_token_idx ON auth_test.refresh_tokens USING btree (token);
comment on table auth_test.refresh_tokens is 'auth_test: Store of tokens used to refresh JWT tokens once they expire.';

-- auth.instances definition

CREATE TABLE auth_test.instances (
	id uuid NOT NULL,
	uuid uuid NULL,
	raw_base_config text NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	CONSTRAINT instances_pkey PRIMARY KEY (id)
);
comment on table auth_test.instances is 'Auth: Manages users across multiple sites.';

-- auth.audit_log_entries definition

CREATE TABLE auth_test.audit_log_entries (
	instance_id uuid NULL,
	id uuid NOT NULL,
	payload json NULL,
	created_at timestamptz NULL,
	CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id)
);
CREATE INDEX audit_logs_instance_id_idx ON auth_test.audit_log_entries USING btree (instance_id);
comment on table auth_test.audit_log_entries is 'Auth: Audit trail for user actions.';

-- auth.schema_migrations definition

CREATE TABLE auth_test.schema_migrations (
	"version" varchar(255) NOT NULL,
	CONSTRAINT schema_migrations_pkey PRIMARY KEY ("version")
);
comment on table auth_test.schema_migrations is 'Auth: Manages updates to the auth system.';

INSERT INTO auth_test.schema_migrations (version)
VALUES  ('20171026211738'),
        ('20171026211808'),
        ('20171026211834'),
        ('20180103212743'),
        ('20180108183307'),
        ('20180119214651'),
        ('20180125194653');

create or replace function auth_test.uid() 
returns uuid 
language sql stable
as $$
  select 
  	coalesce(
		current_setting('request.jwt.claim.sub', true),
		(current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
	)::uuid
$$;

create or replace function auth_test.role() 
returns text 
language sql stable
as $$
  select 
  	coalesce(
		current_setting('request.jwt.claim.role', true),
		(current_setting('request.jwt.claims', true)::jsonb ->> 'role')
	)::text
$$;

create or replace function auth_test.email() 
returns text 
language sql stable
as $$
  select 
  	coalesce(
		current_setting('request.jwt.claim.email', true),
		(current_setting('request.jwt.claims', true)::jsonb ->> 'email')
	)::text
$$;

-- usage on auth functions to API roles
GRANT USAGE ON SCHEMA auth_test TO anon, authenticated, service_role;

-- Supabase super admin
CREATE USER supabase_auth_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
GRANT ALL PRIVILEGES ON SCHEMA auth_test TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth_test TO supabase_auth_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth_test TO supabase_auth_admin;
ALTER USER supabase_auth_admin SET search_path = "auth_test";
ALTER table "auth_test".users OWNER TO supabase_auth_admin;
ALTER table "auth_test".refresh_tokens OWNER TO supabase_auth_admin;
ALTER table "auth_test".audit_log_entries OWNER TO supabase_auth_admin;
ALTER table "auth_test".instances OWNER TO supabase_auth_admin;
ALTER table "auth_test".schema_migrations OWNER TO supabase_auth_admin;

ALTER FUNCTION "auth_test"."uid" OWNER TO supabase_auth_admin;
ALTER FUNCTION "auth_test"."role" OWNER TO supabase_auth_admin;
ALTER FUNCTION "auth_test"."email" OWNER TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION "auth_test"."uid"() TO public_test;
GRANT EXECUTE ON FUNCTION "auth_test"."role"() TO public_test;
GRANT EXECUTE ON FUNCTION "auth_test"."email"() TO public_test;