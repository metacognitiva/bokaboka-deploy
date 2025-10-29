CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`professionalId` int NOT NULL,
	`amount` int NOT NULL,
	`planType` enum('base','destaque') NOT NULL,
	`paymentMethod` enum('credit_card','pix','boleto'),
	`paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`transactionId` varchar(255),
	`paymentGateway` varchar(50),
	`subscriptionStartDate` timestamp,
	`subscriptionEndDate` timestamp,
	`isRecurring` boolean NOT NULL DEFAULT true,
	`nextBillingDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
