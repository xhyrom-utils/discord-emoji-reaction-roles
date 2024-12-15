import config from "../configuration/config.json" assert { type: "json" };

interface Config {
  token: string;
}

export const { token } = config as Config;
