-- D1 schema, the subset of PLAN.md 11.3 the project page and follow flow need.
-- Plain SQLite so it can move to Postgres without a schema change. Times are UTC unix seconds.

CREATE TABLE IF NOT EXISTS project (
  id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  regno TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  promoter TEXT NOT NULL,
  district TEXT NOT NULL,
  locality TEXT NOT NULL,
  status TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  last_read_at INTEGER,
  UNIQUE (state, regno),
  UNIQUE (state, slug)
);

-- The latest grade per project is the row with the largest computed_at.
-- grade_json holds the grader's output exactly as returned, so replay can compare bytes.
CREATE TABLE IF NOT EXISTS grade (
  id TEXT PRIMARY KEY,
  project TEXT NOT NULL REFERENCES project (id),
  rules_version TEXT NOT NULL,
  letter TEXT,
  points INTEGER,
  as_of TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  filings_read INTEGER NOT NULL,
  computed_at INTEGER NOT NULL,
  grade_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS grade_by_project ON grade (project, computed_at);

-- The address is encrypted (AES-GCM) and looked up by a keyed hash. Links in emails are
-- signed with a server secret, so no long-lived token is stored.
CREATE TABLE IF NOT EXISTS follower (
  id TEXT PRIMARY KEY,
  email_hash TEXT NOT NULL UNIQUE,
  email_enc TEXT NOT NULL,
  consent_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- state: pending, active, unfollowed
CREATE TABLE IF NOT EXISTS follow (
  id TEXT PRIMARY KEY,
  follower TEXT NOT NULL REFERENCES follower (id) ON DELETE CASCADE,
  project TEXT NOT NULL REFERENCES project (id),
  state TEXT NOT NULL,
  confirm_token_hash TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  confirmed_at INTEGER,
  last_emailed_at INTEGER,
  UNIQUE (follower, project)
);

CREATE TABLE IF NOT EXISTS email_send (
  id TEXT PRIMARY KEY,
  follow TEXT REFERENCES follow (id) ON DELETE SET NULL,
  template TEXT NOT NULL,
  sent_at INTEGER NOT NULL,
  status TEXT NOT NULL
);

-- Abuse limit for follow requests, by hashed address. No raw IPs are stored.
CREATE TABLE IF NOT EXISTS rate_hit (
  bucket TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_hit_by_key ON rate_hit (bucket, key_hash, at);
