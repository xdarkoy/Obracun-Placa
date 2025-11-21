CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`contractType` enum('ODREĐENO','NEODREĐENO') NOT NULL,
	`grossAmount` int NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date,
	`pensionFundChoice` enum('FBIH_FUND','RS_FUND'),
	`minuliRadStartDate` date NOT NULL,
	`previousTenureYears` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`jmbg` varchar(13) NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`iban` varchar(34),
	`currentResidenceCode` varchar(10) NOT NULL,
	`residenceJurisdiction` enum('FBIH','RS','BD') NOT NULL,
	`taxFactor` int NOT NULL DEFAULT 100,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `municipalities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(255) NOT NULL,
	`jurisdiction` enum('FBIH','RS','BD') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `municipalities_id` PRIMARY KEY(`id`),
	CONSTRAINT `municipalities_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `payrollItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`payrollRunId` int NOT NULL,
	`employeeId` int NOT NULL,
	`contractId` int NOT NULL,
	`inputGross` int NOT NULL,
	`workDays` int NOT NULL DEFAULT 22,
	`seniorityYears` int NOT NULL DEFAULT 0,
	`calculatedGross` int NOT NULL,
	`contributionsFrom` int NOT NULL,
	`contributionsOn` int NOT NULL DEFAULT 0,
	`taxableBase` int NOT NULL,
	`taxAmount` int NOT NULL,
	`netAmount` int NOT NULL,
	`totalCost` int NOT NULL,
	`contributionsBreakdown` text,
	`allowancesBreakdown` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payrollItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payrollRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`status` enum('DRAFT','APPROVED','LOCKED') NOT NULL DEFAULT 'DRAFT',
	`paymentDate` date,
	`createdById` int NOT NULL,
	`approvedById` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payrollRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `taxRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jurisdictionCode` enum('FBIH','RS','BD') NOT NULL,
	`ruleCode` varchar(100) NOT NULL,
	`ruleType` enum('CONTRIBUTION','TAX','LIMIT','DEDUCTION') NOT NULL,
	`rateValue` int NOT NULL,
	`description` text,
	`validFrom` date NOT NULL,
	`validTo` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taxRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`taxId` varchar(50),
	`address` text,
	`jurisdiction` enum('FBIH','RS','BD') NOT NULL,
	`ownerId` int NOT NULL,
	`settingsJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wageTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`isTaxableFBIH` boolean NOT NULL DEFAULT true,
	`isTaxableRS` boolean NOT NULL DEFAULT true,
	`includesInPIO` boolean NOT NULL DEFAULT true,
	`isNetToGross` boolean NOT NULL DEFAULT false,
	`reportingCategory` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wageTypes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_employeeId_employees_id_fk` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payrollItems` ADD CONSTRAINT `payrollItems_payrollRunId_payrollRuns_id_fk` FOREIGN KEY (`payrollRunId`) REFERENCES `payrollRuns`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payrollItems` ADD CONSTRAINT `payrollItems_employeeId_employees_id_fk` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payrollItems` ADD CONSTRAINT `payrollItems_contractId_contracts_id_fk` FOREIGN KEY (`contractId`) REFERENCES `contracts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payrollRuns` ADD CONSTRAINT `payrollRuns_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payrollRuns` ADD CONSTRAINT `payrollRuns_createdById_users_id_fk` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payrollRuns` ADD CONSTRAINT `payrollRuns_approvedById_users_id_fk` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `tenants_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wageTypes` ADD CONSTRAINT `wageTypes_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE no action ON UPDATE no action;