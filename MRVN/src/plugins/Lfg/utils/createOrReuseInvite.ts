import { VoiceChannel, ChannelInvite } from "eris";

export async function createOrReuseInvite(vc: VoiceChannel): Promise<ChannelInvite> {
    const existingInvites = await vc.getInvites();

    if (existingInvites.length !== 0) {
        return existingInvites[0];
    } else {
        return vc.createInvite(undefined);
    }
}