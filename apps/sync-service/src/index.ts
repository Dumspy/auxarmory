import "./env";

import { QueueManager } from "./queue-manager";

class SyncService {
	private queueManager: QueueManager;

	constructor() {
		this.queueManager = new QueueManager();

		this.setupGracefulShutdown();
		this.setupRecurringJobs();
	}

	start() {
		console.log("✅ Sync Service started successfully");
	}

	private setupGracefulShutdown() {
		const shutdown = async (signal: string) => {
			console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

			try {
				await this.queueManager.shutdown();
				console.log("✅ Graceful shutdown completed");
				process.exit(0);
			} catch (error) {
				console.error("❌ Error during shutdown:", error);
				process.exit(1);
			}
		};

		process.on("SIGTERM", () => void shutdown("SIGTERM"));
		process.on("SIGINT", () => void shutdown("SIGINT"));

		// Handle uncaught exceptions
		process.on("uncaughtException", (error) => {
			console.error("❌ Uncaught Exception:", error);
			void shutdown("uncaughtException");
		});

		process.on("unhandledRejection", (reason, promise) => {
			console.error(
				"❌ Unhandled Rejection at:",
				promise,
				"reason:",
				reason,
			);
			void shutdown("unhandledRejection");
		});
	}

	private setupRecurringJobs() {
		console.log("⏰ Setting up recurring jobs...");

		try {
			// Schedule daily cleanup job at 2 AM
			// await this.queueManager.addJob(
			// 	JobTypes.CLEANUP_OLD_DATA,
			// 	{
			// 		dataType: "logs",
			// 		olderThanDays: 30,
			// 	},
			// 	{
			// 		repeat: { pattern: "0 2 * * *" } // Daily at 2 AM
			// 	}
			// );

			console.log("✅ Recurring jobs scheduled");
		} catch (error) {
			console.error("❌ Failed to setup recurring jobs:", error);
		}
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const service = new SyncService();
	service.start();
}

export { SyncService };
