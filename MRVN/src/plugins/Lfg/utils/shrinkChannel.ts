import { VoiceChannel } from "eris";
import { logger } from "../../../logger";

export async function shrinkChannel(voice: VoiceChannel, userMessage: string, cfg: any): Promise < void> {
    if(cfg.lfg_enable_shrink) {
    let shrink: number;
    for (let i: any = 0; i < cfg.lfg_shrink_text_idents.length; i++) {
        if (userMessage.toLowerCase().includes(cfg.lfg_shrink_text_idents[i])) {
            shrink = cfg.lfg_shrink_shrunk_amts[i];
            break;
        }
    }

    try {
        if (shrink) {
            voice.edit({ userLimit: shrink });
        } else {
            voice.edit({ userLimit: cfg.lfg_shrink_normal_amt });
        }
    } catch (error) {
        logger.error(`Ran into an error trying to shrink/unshrink channel (${voice.id}). Are we missing a permission?`);
        logger.error(error);
    }
}
  }