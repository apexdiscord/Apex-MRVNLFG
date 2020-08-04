import { PluginOptions, plugin } from "knub";
import { WherePluginType } from "./types";
import { WhereCmd } from "./commands/WhereCmd";
import { NotifyCmd } from "./commands/NotifyCmd";
import { VcNotifyCmd } from "./commands/VcNotifyCmd";
import { FollowCmd } from "./commands/FollowCmd";
import { FollowStopCmd } from "./commands/FollowStopCmd";
import { VoiceUsageCmd } from "./commands/VoiceUsageCmd";
import { VoiceChannelJoinEvt } from "./events/VoiceChannelJoinEvt";
import { VoiceChannelSwitchEvt } from "./events/VoiceChannelSwitchEvt";
import { VoiceChannelLeaveEvt } from "./events/VoiceChannelLeaveEvt";
import { GuildBanAddEvt } from "./events/GuildBanAddEvt";
import { loadActiveNotifications } from "./utils/loadActiveNotifications";

const defaultOptions: PluginOptions<WherePluginType> = {
  config: {
    where_timeout: 600000,
    update_notification: true,
    persist_notifications: true,

    can_where: false,
    can_notify: false,
    can_follow: false,
    can_usage: false,
  },
  overrides: [
    {
      level: ">=50",
      config: {
        can_where: true,
        can_notify: true,
        can_follow: true,
        can_usage: true,
      },
    },
  ],
};

export const WherePlugin = plugin<WherePluginType>()("where", {
  defaultOptions,

  // prettier-ignore
  commands: [
        WhereCmd,
        NotifyCmd,
        VcNotifyCmd,
        FollowCmd,
        FollowStopCmd,
        VoiceUsageCmd,
    ],

  // prettier-ignore
  events: [
        VoiceChannelJoinEvt,
        VoiceChannelSwitchEvt,
        VoiceChannelLeaveEvt,
        GuildBanAddEvt,
    ],

  onLoad(pluginData) {
    const { state } = pluginData;

    state.activeNotifications = [];
    state.activeVCNotifications = [];
    loadActiveNotifications(pluginData);
  },
});
