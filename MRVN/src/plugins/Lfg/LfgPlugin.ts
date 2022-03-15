import { PluginOptions, typedGuildPlugin } from "knub";
import { LfgPluginType } from "./types";

const defaultOptions: PluginOptions<LfgPluginType> = {
  config: {},
  overrides: [],
};

export const LfgPlugin = typedGuildPlugin<LfgPluginType>()({
  defaultOptions,
  name: "lfg",

  // prettier-ignore
  commands: [
  ],

  // prettier-ignore
  events: [
  ],
});
