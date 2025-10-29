ALTER TABLE `professionals` ADD `documentUrl` text;--> statement-breakpoint
ALTER TABLE `professionals` ADD `selfieUrl` text;--> statement-breakpoint
ALTER TABLE `professionals` ADD `verificationStatus` enum('pending','approved','rejected') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `professionals` ADD `aiVerificationScore` int;--> statement-breakpoint
ALTER TABLE `professionals` ADD `aiVerificationNotes` text;