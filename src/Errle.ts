import { Client, REST, Routes, type ClientOptions } from "discord.js";
import type { Command } from "./struct/Command.ts";
import { readdirSync } from "node:fs";
import { join } from "node:path";

export class Errle extends Client {
  private _token: string;

  private _commands = new Map<string, Command>();

  public constructor(options: ClientOptions, token: string) {
    super(options);

    this._token = token;
    this.rest.setToken(token);
  }

  public command(name: string): Command | undefined {
    return this._commands.get(name);
  }

  public async load(): Promise<void> {
    for (const folder of readdirSync(join(__dirname, "commands")).filter(
      (file) => file.endsWith(".ts"),
    )) {
      const { default: command } = await import(
        join(__dirname, "commands", folder)
      );

      if ("data" in command && "execute" in command) {
        this._commands.set(command.data.name, command);

        console.log(`Command ${command.data.name} has been loaded. :)`);
      } else {
        console.error(`Command ${folder} is missing data or execute method.`);
      }
    }
  }

  public async deploy(): Promise<void> {
    const data = await this.rest.put(
      Routes.applicationCommands(
        Buffer.from(this._token!.split(".")[0], "base64").toString(),
      ),
      { body: [...this._commands.values()].map((c) => c.data.toJSON()) },
    );

    console.log("Commands have been deployed. :)");
  }

  public login(token?: string): Promise<string> {
    return super.login(this._token ?? token);
  }
}
