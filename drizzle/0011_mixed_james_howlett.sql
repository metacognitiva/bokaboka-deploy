CREATE TABLE `moderation_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`targetProfessionalId` int NOT NULL,
	`actionType` enum('warning','suspend_7_days','suspend_15_days','suspend_30_days','ban_permanent','delete_account') NOT NULL,
	`reason` text NOT NULL,
	`relatedReportId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moderation_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterUserId` int,
	`reportedProfessionalId` int NOT NULL,
	`category` enum('fraud','inappropriate_behavior','service_not_delivered','fake_profile','harassment','illegal_activity','other') NOT NULL,
	`description` text NOT NULL,
	`evidenceUrls` text,
	`status` enum('pending','under_review','resolved','rejected') NOT NULL DEFAULT 'pending',
	`resolution` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`resolvedByAdminId` int,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
