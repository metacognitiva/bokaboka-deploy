CREATE TABLE `systemSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` int,
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
ALTER TABLE `professionals` ADD `beforeAfterPhotos` text;--> statement-breakpoint
ALTER TABLE `professionals` ADD `responseTime` int;--> statement-breakpoint
ALTER TABLE `referrals` ADD `discountAmount` int DEFAULT 1000 NOT NULL;--> statement-breakpoint
ALTER TABLE `referrals` DROP COLUMN `rewardAmount`;