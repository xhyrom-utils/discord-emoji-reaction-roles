import { channelLink } from "discord.js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

interface Database {
  [key: string]: {
    [key: string]: {
      [key: string]: {
        roleId: string;
        permanent: boolean;
      };
    };
  };
}

var database: Database = await read();

export function add(
  channelId: string,
  messageId: string,
  roleId: string,
  emoji: string,
  permanent: boolean,
) {
  const data = database[channelId] ?? {};
  const messageData = data[messageId] ?? {};

  messageData[emoji] = {
    roleId,
    permanent,
  };

  data[messageId] = messageData;
  database[channelId] = data;
}

export function remove(channelId: string, messageId: string) {
  if (database[channelId]) {
    delete database[channelId][messageId];
  }
}

export function get(channelId: string, messageId: string, emoji?: string) {
  if (!emoji) return database?.[channelId]?.[messageId];
  return database[channelId]?.[messageId]?.[emoji];
}

export async function read(): Promise<Database> {
  if (database) return database;

  try {
    const { default: data } = await import("../configuration/database.json");
    return data as Database;
  } catch {
    return {};
  }
}

export function write() {
  writeFileSync(
    join(__dirname, "..", "configuration", "database.json"),
    JSON.stringify(database, null, 2),
  );
}
