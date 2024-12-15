import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { Command } from "../struct/Command";
import { messages } from "../config";

export default {
  data: new SlashCommandBuilder()
    .setName("rewelcome")
    .setDescription("Send a welcome message to a user."),
  execute: async (self: Command, interaction: ChatInputCommandInteraction) => {
    try {
      await interaction.user.send(
        messages.welcome.build({ username: interaction.user.username }),
      );
    } catch {
      await interaction.reply({
        ...messages.disabledDms.build(),
        ephemeral: true,
      });
    }
  },
} satisfies Command;
