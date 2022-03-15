import { PluginOptions, typedGuildPlugin } from "knub";
import { ModerationPluginType } from "./types";

const defaultOptions: PluginOptions<ModerationPluginType> = {
  config: {},
  overrides: [],
};

export const ModerationPlugin = typedGuildPlugin<ModerationPluginType>()({
  defaultOptions,
  name: "moderation",

  // prettier-ignore
  commands: [
  ],

  // prettier-ignore
  events: [
  ],
});
