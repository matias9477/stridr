CREATE TABLE `goal_changes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`effective_from` text NOT NULL,
	`steps` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `goal_changes_uuid_unique` ON `goal_changes` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `goal_changes_effective_from_unique` ON `goal_changes` (`effective_from`);--> statement-breakpoint
CREATE TABLE `manual_activity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`kind` text NOT NULL,
	`day` text NOT NULL,
	`steps` integer NOT NULL,
	`estimated_steps` integer,
	`distance_meters` real,
	`duration_seconds` integer,
	`stride_meters` real,
	`cadence_spm` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `manual_activity_uuid_unique` ON `manual_activity` (`uuid`);--> statement-breakpoint
CREATE INDEX `manual_activity_day_idx` ON `manual_activity` (`day`);