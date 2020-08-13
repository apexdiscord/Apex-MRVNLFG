import { Member, TextableChannel } from "eris";
import { sendErrorMessage } from "../../../pluginUtils";

export async function moveRequestor(requestor: Member, newChannelId: string, errorChannel: TextableChannel) {
    if (requestor.voiceState.channelID != null) {
        try {
            await requestor.edit({
                channelID: newChannelId,
            });
        } catch (e) {
            sendErrorMessage(errorChannel, "Failed to move you. Are you in a voice channel?");
            return;
        }
    }
}