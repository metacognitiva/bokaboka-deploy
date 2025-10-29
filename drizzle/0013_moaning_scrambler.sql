ALTER TABLE `professionals` ADD `documentPhotoUrl` text;--> statement-breakpoint
ALTER TABLE `professionals` ADD `selfiePhotoUrl` text;--> statement-breakpoint
ALTER TABLE `professionals` ADD `aiVerificationResult` text;--> statement-breakpoint
ALTER TABLE `professionals` DROP COLUMN `documentUrl`;--> statement-breakpoint
ALTER TABLE `professionals` DROP COLUMN `selfieUrl`;--> statement-breakpoint
ALTER TABLE `professionals` DROP COLUMN `aiVerificationScore`;--> statement-breakpoint
ALTER TABLE `professionals` DROP COLUMN `aiVerificationNotes`;