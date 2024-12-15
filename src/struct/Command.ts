import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export interface Command {
  data: Partial<SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder>;
  execute(
    self: Command,
    interaction: ChatInputCommandInteraction,
  ): Promise<void>;

  [key: string]: any;
}
