CREATE TABLE `page_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`path` varchar(255) NOT NULL,
	`userId` int,
	`sessionId` varchar(64),
	`referrer` text,
	`userAgent` text,
	`device` enum('mobile','desktop','tablet'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `page_views_id` PRIMARY KEY(`id`)
);
