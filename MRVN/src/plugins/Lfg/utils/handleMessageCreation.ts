import { PluginData } from "knub";
import { LfgPluginType } from "../types";
import { createOrReuseInvite } from "./createOrReuseInvite";
import { getInviteLink } from "knub/dist/helpers";
import Eris, { VoiceChannel, Member } from "eris";

export async function handleMessageCreation(pluginData: PluginData<LfgPluginType>, vc: VoiceChannel, member: Member, message: string, ranked: boolean): Promise<any> {
    const cfg = pluginData.config.getForMember(member);
    let channelInfo: string = null;
    const invite = await createOrReuseInvite(vc);

    if (invite !== null) {
        if (cfg.lfg_message_compact) {
            channelInfo = member.mention;

            if (cfg.lfg_list_others) {
                const otherUsers: Eris.Collection<Member> = vc.voiceMembers;

                otherUsers.forEach((vcUser) => {
                    if (vcUser.id !== member.id) {
                        let nick: string = vcUser.nick;
                        if (nick === null) {
                            nick = vcUser.username;
                        }
                        channelInfo += " + " + nick;
                    }
                });
            }

            channelInfo += ` in ${vc.name}: ${message} ${getInviteLink(invite)}`;
        } else {
            channelInfo = "Join " + member.mention;

            if (cfg.lfg_list_others) {
                const otherUsers: Eris.Collection<Member> = vc.voiceMembers;

                otherUsers.forEach((vcUser) => {
                    if (vcUser.id !== member.id) {
                        let nick: string = vcUser.nick;
                        if (nick === null) {
                            nick = vcUser.username;
                        }
                        channelInfo += " + " + nick;
                    }
                });
            }

            channelInfo += ` in ${vc.name} ${getInviteLink(invite)}\n${message}`;
        }
    }

    if (ranked && cfg.lfg_enable_emotes) {
        let rankEmoji: string = "";
        let firstRank: boolean = true;

        const idents: string[] = cfg.lfg_emotes_idents;
        const emotes: string[] = cfg.lfg_emotes_names;

        for (let i: number = 0; i < idents.length; i++) {
            if (message.toLowerCase().includes(idents[i])) {
                if (firstRank) {
                    firstRank = false;
                    rankEmoji = cfg.lfg_emotes_found_append;
                }
                rankEmoji += `${emotes[i]} `;
            }
        }

        if (firstRank) {
            rankEmoji = cfg.lfg_emotes_notfound_append;
        }

        channelInfo += rankEmoji;
    }

    return channelInfo;
}