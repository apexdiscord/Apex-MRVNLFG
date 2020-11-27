import { Invite, VoiceChannel } from "eris";

export async function createOrReuseInvite(vc: VoiceChannel): Promise<Invite> {
  const existingInvites = await vc.getInvites();

  if (existingInvites.length !== 0) {
    return existingInvites[0];
  } else {
    return vc.createInvite(undefined);
  }
}
