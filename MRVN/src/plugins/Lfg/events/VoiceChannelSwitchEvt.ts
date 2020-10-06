import { cons } from "fp-ts/lib/ReadonlyArray";
import { lfgEvent } from "../types";

export const VoiceChannelSwitchEvt = lfgEvent({
  event: "voiceChannelSwitch",

  async listener(meta) {
    const vc = meta.args.oldChannel;
    const cfg = meta.pluginData.config.getForChannel(vc);

    let newName = vc.name;
    if (
      vc.guild.id === "541484311354933258" &&
      (vc.parentID === "762813514154639360" ||
        vc.parentID === "762813602901000202" ||
        vc.parentID === "762813628155691028")
    ) {
      const voiceNum = vc.name.match(/\d+/)[0];
      newName = `Voice Channel ${voiceNum}`;
    }

    let newUserLimit = vc.userLimit;
    if (
      cfg.lfg_enable_shrink &&
      vc.voiceMembers.size === 0 &&
      vc.userLimit !== cfg.lfg_shrink_normal_amt &&
      vc.name.toLowerCase().includes(cfg.lfg_voice_ident)
    ) {
      newUserLimit = cfg.lfg_shrink_normal_amt;
    }

    if (newName !== vc.name || newUserLimit !== vc.userLimit) {
      vc.edit({ userLimit: cfg.lfg_shrink_normal_amt, name: newName });
    }
  },
});
