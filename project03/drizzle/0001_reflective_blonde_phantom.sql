CREATE TABLE `reading_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`entry_id` text NOT NULL,
	`pages` integer NOT NULL,
	`logged_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`entry_id`) REFERENCES `shelf_entries`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "pages_positive" CHECK("reading_logs"."pages" > 0)
);
