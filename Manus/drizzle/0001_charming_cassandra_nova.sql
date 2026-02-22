CREATE TABLE `citations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resultId` int NOT NULL,
	`source` varchar(255) NOT NULL,
	`sourceUrl` varchar(512),
	`authors` text,
	`publicationDate` varchar(50),
	`relevanceScore` int,
	`context` text,
	`citationIndex` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `citations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `research_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`queryId` int NOT NULL,
	`resultId` int,
	`sessionName` varchar(255),
	`notes` text,
	`isSaved` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `research_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `research_queries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`query` text NOT NULL,
	`topic` varchar(255),
	`description` text,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `research_queries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `research_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`queryId` int NOT NULL,
	`userId` int NOT NULL,
	`summary` text,
	`keyFindings` text,
	`consensus` text,
	`disagreements` text,
	`researchGaps` text,
	`confidenceScore` int,
	`agentReasoning` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `research_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`resultId` int NOT NULL,
	`rating` int,
	`accuracy` int,
	`relevance` int,
	`completeness` int,
	`trustScore` int,
	`comment` text,
	`suggestedImprovements` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vault_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` varchar(512) NOT NULL,
	`fileType` varchar(50),
	`fileSize` int,
	`documentType` enum('paper','note','dataset','protocol','other') NOT NULL DEFAULT 'other',
	`title` varchar(255),
	`description` text,
	`tags` text,
	`embedding` text,
	`isIndexed` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vault_documents_id` PRIMARY KEY(`id`)
);
