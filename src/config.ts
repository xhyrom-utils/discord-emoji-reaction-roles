import config from "../configuration/config.json" assert { type: "json" };

interface Config {
  token: string;
  messages: {
    reactionAdd: string;
    reactionRemove: string;
    reactionRemovePermanent: string;
  };
}

export const { token, messages } = {
  token: config.token,
  messages: {
    reactionAdd: config.messages.reaction_add,
    reactionRemove: config.messages.reaction_remove,
    reactionRemovePermanent: config.messages.reaction_remove_permanent,
  },
} as Config;
