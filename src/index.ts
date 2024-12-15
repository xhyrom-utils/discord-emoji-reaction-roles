import { Events, GatewayIntentBits, Partials } from "discord.js";
import { token, messages } from "./config.ts";
import { Errle } from "./Errle.ts";
import { get } from "./database.ts";

const client = new Errle(
  {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  },
  token,
);

await client.load();
await client.deploy();

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.command(interaction.commandName);
  if (!command) return;

  command.execute.call(command, command, interaction);
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch {
      return;
    }
  }

  if (user.bot) return;

  const member = await reaction.message.guild?.members.fetch(user.id);

  const channelId = reaction.message.channelId;
  const messageId = reaction.message.id;
  const emoji = reaction.emoji.id ?? reaction.emoji.name;
  if (!emoji) return;

  const db = get(channelId, messageId, emoji);

  const roleName = (await reaction.message.guild?.roles.fetch(db.roleId))?.name;
  if (!roleName) return;

  try {
    await member?.roles.add(db.roleId);
  } catch {}

  try {
    await member?.send(
      messages.reactionAdd
        .replace("{roleId}", db.roleId)
        .replace("{roleName}", roleName),
    );
  } catch {}
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch {
      return;
    }
  }

  if (user.bot) return;

  const member = await reaction.message.guild?.members.fetch(user.id);

  const channelId = reaction.message.channelId;
  const messageId = reaction.message.id;
  const emoji = reaction.emoji.id ?? reaction.emoji.name;
  if (!emoji) return;

  const db = get(channelId, messageId, emoji);

  const roleName = (await reaction.message.guild?.roles.fetch(db.roleId))?.name;
  if (!roleName) return;

  if (db.permanent) {
    try {
      await member?.send(
        messages.reactionRemovePermanent
          .replace("{roleId}", db.roleId)
          .replace("{roleName}", roleName),
      );
    } catch {}
    return;
  }

  try {
    await member?.roles.remove(db.roleId);
  } catch {}

  try {
    await member?.send(
      messages.reactionRemove
        .replace("{roleId}", db.roleId)
        .replace("{roleName}", roleName),
    );
  } catch {}
});

client.login();
