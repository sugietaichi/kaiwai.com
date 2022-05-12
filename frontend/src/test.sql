CREATE TABLE posts (
    id VARCHAR(36) NOT NULL DEFAULT (uuid()),
    current_path VARCHAR(50) NOT NULL,
    parent_path VARCHAR(50) NOT NULL,
    screen_name VARCHAR(20) NOT NULL DEFAULT 'nanasi',
    public_key_hex VARCHAR(255) NOT NULL,
    der_signature VARCHAR(255) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    created_at DATETIME(2) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    PRIMARY KEY(id)
);