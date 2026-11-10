-- Review this SQL and take a database backup before executing it.
-- This file is provided for manual review only; it has not been run.
-- MySQL 5.7 may rebuild these tables and hold metadata locks during ALTER TABLE.

ALTER TABLE `products`
  MODIFY COLUMN `image` VARCHAR(2048)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    NULL;

ALTER TABLE `shops`
  MODIFY COLUMN `image` VARCHAR(2048)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    NULL;

ALTER TABLE `workshops`
  MODIFY COLUMN `image` VARCHAR(2048)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    NULL;
