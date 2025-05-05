import { createEvent } from "#base";
import { logger } from "#settings";
import { ActivityType } from "discord.js";
import { initializeDatabase } from "#database";


createEvent({
    name: "Ready Handler",
    event: "ready",
    async run(client) {
        client.user.setPresence({
            activities: [{ name: `/ajuda para mais comandos`, type: ActivityType.Custom }],
            status: 'online',
        })
        const dbStarted = initializeDatabase();
        if (!dbStarted) {
            logger.error("Database not started");
            return;
        }

        logger.success(`Logged in as ${client.user.tag} 🤖`);
    },
});