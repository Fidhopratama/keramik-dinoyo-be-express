-- Review this SQL and take a database backup before executing it.
-- This file is provided for manual review only; it has not been run.

CREATE TABLE `upload_sessions` (
  `id` CHAR(36) BINARY NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `asset_type` ENUM('product', 'shop', 'workshop') NOT NULL,
  `pathname` VARCHAR(512) NOT NULL,
  `expected_content_type` VARCHAR(100) NOT NULL,
  `status` ENUM('pending', 'uploading', 'uploaded', 'consumed', 'expired') NOT NULL DEFAULT 'pending',
  `url` VARCHAR(2048) NULL,
  `size` BIGINT UNSIGNED NULL,
  `expires_at` DATETIME NOT NULL,
  `completed_at` DATETIME NULL,
  `consumed_at` DATETIME NULL,
  `consumed_entity_type` VARCHAR(50) NULL,
  `consumed_entity_id` BIGINT UNSIGNED NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `upload_sessions_pathname_uq` (`pathname`),
  KEY `upload_sessions_user_id_idx` (`user_id`),
  KEY `upload_sessions_status_idx` (`status`),
  KEY `upload_sessions_expires_at_idx` (`expires_at`),
  CONSTRAINT `upload_sessions_user_id_fk`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARACTER SET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
