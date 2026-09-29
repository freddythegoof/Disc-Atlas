CREATE TABLE `bag_items` (
	`user_id` text NOT NULL,
	`id` text NOT NULL,
	`disc_id` text NOT NULL,
	`plastic` text DEFAULT '' NOT NULL,
	`weight` integer,
	`wear` text DEFAULT 'unknown' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `id`)
);
--> statement-breakpoint
CREATE TABLE `coach_usage` (
	`user_id` text NOT NULL,
	`day` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `day`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`profile` text NOT NULL,
	`updated_at` text NOT NULL
);
