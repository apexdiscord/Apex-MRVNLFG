import { lfgEvent } from "../types";

export const VoiceChannelLeaveEvt = lfgEvent({
  event: "voiceChannelLeave",

  async listener(meta) {
    const vc = meta.args.oldChannel;
    const cfg = meta.pluginData.config.getForChannel(vc);

    if (
      cfg.lfg_enable_shrink &&
      vc.voiceMembers.size === 0 &&
      vc.userLimit !== cfg.lfg_shrink_normal_amt &&
      vc.name.toLowerCase().includes(cfg.lfg_voice_ident)
    ) {
      vc.edit({ userLimit: cfg.lfg_shrink_normal_amt });
    }
  },
});
