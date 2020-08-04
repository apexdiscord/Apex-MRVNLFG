import { PluginOptions, plugin } from "knub";
import { LfgPluginType } from "./types";
import { DelayCmd } from "./commands/DelayCmd";
import { MessageCreateEvt } from "./events/MessageCreateEvt";
import { VoiceChannelSwitchEvt } from "./events/VoiceChannelSwitchEvt";
import { VoiceChannelLeaveEvt } from "./events/VoiceChannelLeaveEvt";
import { LfgMessageCreateEvt } from "./events/LfgMessageCreateEvt";

const defaultOptions: PluginOptions<LfgPluginType> = {
  config: {
    lfg_command_ident: "!lfg",
    lfg_shrink_ident: "!shrink",
    lfg_shrink_default: 2,
    lfg_unshrink_ident: "!unshrink",
    lfg_voice_ident: "lfg",
    lfg_text_ident: "lfg",
    lfg_message_compact: true,
    lfg_list_others: true,

    lfg_enable_emotes: false,
    lfg_emotes_chan_ident: "ranked",
    lfg_emotes_idents: ["examplename1", "examplename2"],
    lfg_emotes_names: ["<:test2:671473369891340293>", "<:testEmoji:608348601575407661>"],
    lfg_emotes_found_append: "\n**Ranks in this message: **",
    lfg_emotes_notfound_append: "\n**No ranks in this message**",

    lfg_enable_shrink: false,
    lfg_shrink_text_idents: ["duo", "1v1", "solo"],
    lfg_shrink_shrunk_amts: [2, 2, 1],
    lfg_shrink_normal_amt: 3,

    can_delay: false,
  },
  overrides: [
    {
      level: ">=50",
      config: {
        can_delay: true,
      },
    },
  ],
};

export const LfgPlugin = plugin<LfgPluginType>()("lfg", {
  defaultOptions,

  // prettier-ignore
  commands: [
        DelayCmd,
    ],

  // prettier-ignore
  events: [
    LfgMessageCreateEvt,
    // MessageCreateEvt,        Old version
    VoiceChannelSwitchEvt,
    VoiceChannelLeaveEvt,
  ],

  onLoad(pluginData) {
    const { state } = pluginData;

    state.delay = [];
    state.current_pos = 0;
  },
});
