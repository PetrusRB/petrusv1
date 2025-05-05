import mongoose, { InferSchemaType, model } from "mongoose";
import { guildSchema } from "./schemas/guild.js";
import { memberSchema } from "./schemas/member.js";
import { logger } from "#settings";
import chalk from "chalk";

export const db = {
   guilds: model("guild", guildSchema, "guilds"),
   members: model("member", memberSchema, "members")
};

export async function initializeDatabase(): Promise<boolean> {
   const mongoUri = process.env.MONGO_URI;
   if (!mongoUri) {
      logger.error(chalk.red("MONGO_URI is not defined in the environment variables."));
      return false;
   }

   try {
      logger.log(chalk.blue("Connecting to MongoDB..."));
      await mongoose.connect(mongoUri, { dbName: "petrusdb" });
      logger.success(chalk.green("MongoDB connected"));
   } catch (err) {
      logger.error(err);
      return false;
   }
   return true;
}

export type GuildSchema = InferSchemaType<typeof guildSchema>;
export type MemberSchema = InferSchemaType<typeof memberSchema>;