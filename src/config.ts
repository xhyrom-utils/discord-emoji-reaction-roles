import {
  EmbedBuilder,
  type BaseMessageOptions,
  type HexColorString,
  type MessageCreateOptions,
  type MessagePayload,
} from "discord.js";
import config from "../configuration/config.json" assert { type: "json" };

abstract class Message {
  protected replacePlaceholders(
    text: string,
    ...placeholders: Record<string, string>[]
  ): string {
    let newText = text;

    for (const placeholder of placeholders) {
      for (const [key, value] of Object.entries(placeholder)) {
        newText = newText.replaceAll(`{${key}}`, value);
      }
    }

    return newText;
  }

  abstract send(): boolean;
  abstract build(...placeholders: Record<string, string>[]): BaseMessageOptions;
}

class SimpleMessage extends Message {
  private content: string;
  private _send: boolean;

  public constructor(content: string, _send: boolean) {
    super();

    this.content = content;
    this._send = _send;
  }

  public send(): boolean {
    return this._send;
  }

  public build(...placeholders: Record<string, string>[]): BaseMessageOptions {
    return {
      content: this.replacePlaceholders(this.content, ...placeholders),
    };
  }
}

class EmbedMessage extends Message {
  private title: string;
  private description: string;
  private color: string;
  private _send: boolean;

  public constructor(
    title: string,
    description: string,
    color: string,
    _send: boolean,
  ) {
    super();
    this.title = title;
    this.description = description;
    this.color = color;
    this._send = _send;
  }

  public send(): boolean {
    return this._send;
  }

  public build(...placeholders: Record<string, string>[]): BaseMessageOptions {
    return {
      embeds: [
        new EmbedBuilder()
          .setTitle(this.replacePlaceholders(this.title, ...placeholders))
          .setDescription(
            this.replacePlaceholders(this.description, ...placeholders),
          )
          .setColor(this.color as HexColorString),
      ],
    };
  }
}

type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
  ? `${P}${Capitalize<CamelCase<Q>>}`
  : S;

type CamelCaseKeys<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K];
};

interface Config {
  token: string;
  messages: {
    [K in keyof CamelCaseKeys<typeof config.messages>]: Message;
  };
}

function message<T extends Message>(key: keyof typeof config.messages): T {
  const send = config.send?.[key as keyof typeof config.send] ?? true;
  const message = config.messages[key];

  if (typeof message === "string")
    return new SimpleMessage(message, send) as unknown as T;

  if (typeof message === "object" && Array.isArray(message))
    return new SimpleMessage(message.join("\n"), send) as unknown as T;

  return new EmbedMessage(
    message.title,
    Array.isArray(message.description)
      ? message.description.join("\n")
      : message.description,
    message.color,
    send,
  ) as unknown as T;
}

export const { token, messages } = {
  token: config.token,
  messages: {
    reactionAdd: message<Message>("reaction_add"),
    reactionRemove: message<Message>("reaction_remove"),
    reactionRemovePermanent: message<Message>("reaction_remove_permanent"),
    disabledDms: message<Message>("disabled_dms"),
    welcome: message<Message>("welcome"),
  },
} satisfies Config;
