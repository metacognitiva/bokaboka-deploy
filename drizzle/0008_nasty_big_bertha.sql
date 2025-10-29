ALTER TABLE `reviews` ADD `servicePhotoUrl` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `verificationPhotoUrl` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `confirmationToken` varchar(64);--> statement-breakpoint
ALTER TABLE `reviews` ADD `isVerified` boolean DEFAULT false NOT NULL;