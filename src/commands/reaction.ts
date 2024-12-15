import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  type TextBasedChannel,
} from "discord.js";
import type { Command } from "../struct/Command.ts";
import { add, get, remove, write } from "../database.ts";

export default {
  data: new SlashCommandBuilder()
    .setName("reaction")
    .setDescription("Reacts to a message with a specified emoji.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("add")
        .setDescription("Adds a reaction to a message.")
        .addStringOption((option) =>
          option
            .setName("message_id")
            .setDescription("The ID of the message to react to.")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("emoji")
            .setDescription("The emoji to react with.")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("role_id")
            .setDescription(
              "The ID of the role to give to the user when they react.",
            )
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("channel_id")
            .setDescription("The ID of the channel to react in.")
            .setRequired(false),
        )
        .addBooleanOption((option) =>
          option
            .setName("permanent")
            .setDescription(
              "Whether the role should be permanent (can't remove later) or not.",
            ),
        ),
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("remove")
        .setDescription("Removes a reaction from a message.")
        .addStringOption((option) =>
          option
            .setName("message_id")
            .setDescription("The ID of the message to react to.")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("channel_id")
            .setDescription("The ID of the channel to react in.")
            .setRequired(false),
        ),
    ),
  execute: async (self, interaction) => {
    const subCommand = interaction.options.getSubcommand();

    (
      self![subCommand] as (
        interaction: ChatInputCommandInteraction,
      ) => Promise<void>
    )(interaction);
  },
  add: async (interaction: ChatInputCommandInteraction) => {
    const messageId = interaction.options.getString("message_id", true);
    const channelId =
      interaction.options.getString("channel_id", false) ??
      interaction.channelId;

    const emoji = interaction.options.getString("emoji", true);
    const roleId = interaction.options.getString("role_id", true);
    const permanent =
      interaction.options.getBoolean("permanent", false) ?? false;

    const message = await (
      (await interaction.guild!.channels.fetch(channelId)) as TextBasedChannel
    ).messages.fetch(messageId);

    if (!message) {
      interaction.reply({
        content: `The message ${messageId} in channel <#${channelId}> was not found.`,
        ephemeral: true,
      });
      return;
    }

    const role = await interaction.guild!.roles.fetch(roleId);

    if (!role) {
      interaction.reply({
        content: `The role ${roleId} was not found.`,
        ephemeral: true,
      });
      return;
    }

    const emojiId = emoji.match(/<a?:\w+:(\d+)>/)?.[1] ?? emoji;

    try {
      await message.react(emojiId);
    } catch (error) {
      interaction.reply({
        content: `Failed to react to message ${messageId}.`,
        ephemeral: true,
      });
      return;
    }

    add(channelId, messageId, roleId, emojiId, permanent);
    write();

    interaction.reply({
      content: `Reaction ${emoji} added to message ${messageId} in channel <#${channelId}>.`,
      ephemeral: true,
    });
  },
  remove: async (interaction: ChatInputCommandInteraction) => {
    const messageId = interaction.options.getString("message_id", true);
    const channelId =
      interaction.options.getString("channel_id", false) ??
      interaction.channelId;

    const message = await (
      (await interaction.guild!.channels.fetch(channelId)) as TextBasedChannel
    ).messages.fetch(messageId);

    if (!message) {
      interaction.reply({
        content: `The message ${messageId} in channel <#${channelId}> was not found.`,
        ephemeral: true,
      });
      return;
    }

    const db = get(channelId, messageId);
    for (const emojiId of Object.keys(db)) {
      message.reactions.cache
        .get(emojiId)
        ?.remove()
        .catch(() => {});
    }

    remove(channelId, messageId);
    write();

    interaction.reply({
      content: `Reactions removed from message ${messageId} in channel <#${channelId}>.`,
      ephemeral: true,
    });
  },
} satisfies Command;
