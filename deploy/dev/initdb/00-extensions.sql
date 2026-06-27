-- Local-dev parity with the backend Postgres init Job (issue 7.10).
--
-- The allpets-backend init Job (deploy/k8s/database/postgres-init-job.yaml) pre-creates
-- these trusted extensions in `appdb` so app migrations (Spring/Flyway 20.2) never fail
-- on `CREATE EXTENSION`. The official postgres image runs this script ONCE, on first init
-- of an empty data dir, against POSTGRES_DB (appdb) as the superuser (app_svc here).
--
-- Keep this list in sync with the backend init Job's extension set.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
