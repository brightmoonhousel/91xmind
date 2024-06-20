DROP TABLE IF EXISTS activation_codes;

-- 创建新的激活码表
CREATE TABLE IF NOT EXISTS activation_codes (
    id INTEGER PRIMARY KEY,
    token TEXT NOT NULL,
    activation_time INTEGER NOT NULL DEFAULT 0,
    is_used INTEGER NOT NULL DEFAULT 0
);