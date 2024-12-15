import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { Command } from "../struct/Command";
import { messages } from "../config";

export default {
  data: new SlashCommandBuilder()
    .setName("rewelcome")
    .setDescription("Send a welcome message to a user."),
  execute: async (self: Command, interaction: ChatInputCommandInteraction) => {
    await interaction.reply({
      ...messages.welcome.build({ username: interaction.user.username }),
      ephemeral: true,
    });
  },
} satisfies Command;
