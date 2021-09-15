
CREATE TABLE IF NOT EXISTS registry (
    id INTEGER PRIMARY KEY,
    identifier text,
    created_at datetime,
    username text,
    ip text,
    revoked boolean,
    signature text
)
