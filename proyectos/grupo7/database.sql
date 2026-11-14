CREATE DATABASE IF NOT EXISTS portada_oculta_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE portada_oculta_db;

CREATE TABLE IF NOT EXISTS puntuaciones (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  player_name VARCHAR(20) NOT NULL,
  score INT UNSIGNED NOT NULL,
  game_token CHAR(32) NOT NULL,
  game_mode VARCHAR(20) NOT NULL DEFAULT 'covers',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_game_token (game_token),
  KEY idx_score (score, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
