import { performance } from "perf_hooks";
import { Invite, Member, Message, TextChannel, User, VoiceChannel } from "eris";
import Eris = require("eris");
import { decorators as d, getInviteLink, IPluginOptions, logger, Plugin } from "knub";
import { passesFilter } from "../blockedWords";
import { trimLines } from "../utils";

interface ILfgPluginConfig {
  lfg_command_ident: string;
  lfg_unshrink_ident: string;
  lfg_voice_ident: string;
  lfg_text_ident: string;
  lfg_message_compact: boolean;
  lfg_list_others: boolean;

  lfg_enable_emotes: boolean;
  lfg_emotes_chan_ident: string;
  lfg_emotes_idents: string[];
  lfg_emotes_names: string[];
  lfg_emotes_found_append: string;
  lfg_emotes_notfound_append: string;

  lfg_enable_shrink: boolean;
  lfg_shrink_text_idents: string[];
  lfg_shrink_shrunk_amts: number[];
  lfg_shrink_normal_amt: number;

  can_delay: boolean;
}

export class LfgPlugin extends Plugin<ILfgPluginConfig> {
  public static pluginName = "lfg";
  private delay = [];
  private current_pos = 0;

  getDefaultOptions(): IPluginOptions<ILfgPluginConfig> {
    return {
      config: {
        lfg_command_ident: "!lfg",
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
  }

  @d.event("messageCreate", "guild", true)
  async lfgRequest(msg: Message): Promise<void> {
    const cfg = this.getConfig();
    const requestor = msg.member;
    const text = this.bot.getChannel(msg.channel.id) as TextChannel;
    const start: any = performance.now();

    // check if the text channel is a valid LFG text channel
    if (text.name.toLowerCase().includes(cfg.lfg_text_ident.toLowerCase())) {
      // why this weird german character: "ß"? Because [\s\S] didnt work
      let regex: RegExp = new RegExp("^" + cfg.lfg_command_ident + "([^ß]|[ß])*$", "i");

      // check if the message is an actual LFG request
      if (msg.content.match(regex) != null) {
        logger.info(
          `${requestor.id}: ${requestor.username}#${requestor.discriminator} Started LFG request in ${text.name}`,
        );

        // make sure the text does not include a word blocked in blocked.yml
        if (passesFilter(msg.cleanContent)) {
          try {
            const voice = this.bot.getChannel(requestor.voiceState.channelID) as VoiceChannel;
            regex = new RegExp("^([^ß]|[ß])*" + cfg.lfg_voice_ident + "([^ß]|[ß])*$", "i");

            // make sure the users voice channel is a valid lfg voice channel
            if (voice.name.match(regex) != null) {
              const voiceLimit: any = voice.userLimit > 0 ? voice.userLimit : 999;
              if (voice.voiceMembers.size < voiceLimit) {
                let userMessage: string = msg.content.substring(cfg.lfg_command_ident.length).trim();

                // todo: change to config option
                if (userMessage.length <= 275) {
                  regex = new RegExp("`", "g");
                  userMessage = userMessage.replace(regex, "");

                  if (userMessage !== "") {
                    userMessage = cfg.lfg_message_compact ? `\`${userMessage}\`` : `\`\`\`${userMessage}\`\`\``;
                  }

                  let emotes: boolean = false;
                  if (cfg.lfg_enable_emotes) {
                    emotes = text.name.includes(cfg.lfg_emotes_chan_ident);
                  }

                  try {
                    await msg.channel.getMessage(msg.id);
                  } catch (error) {
                    logger.info(
                      `${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: Source message not found (${msg.id}). It was probably deleted. [${error}]`,
                    );
                    return;
                  }

                  await this.shrinkChannel(voice, userMessage, cfg);

                  const toPost: any = await this.handleMessageCreation(voice, requestor.user, userMessage, emotes);
                  msg.channel.createMessage(toPost);

                  logger.info(
                    `${requestor.id}: ${requestor.username}#${requestor.discriminator} Succesfully completed LFG request`,
                  );

                  // add time taken for this command to the delays array so the delay command has up-to-date info
                  this.updateDelayTime(start);
                } else {
                  text.createMessage("Sorry, but that message is too long! " + requestor.mention);
                  logger.info(
                    `${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: Message length = ${userMessage.length}`,
                  );
                }
              } else {
                text.createMessage("Sorry, but that voice channel is full! " + requestor.mention);
                logger.info(
                  `${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: Channel full`,
                );
              }
            } else {
              text.createMessage("Sorry, but you have to be in a lfg voice channel! " + requestor.mention);
              logger.info(
                `${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: Not in channel`,
              );
            }
          } catch (error) {
            text.createMessage("Sorry, but you have to be in a lfg voice channel! " + requestor.mention);
            logger.info(
              `${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: Not in channel`,
            );
          }
        } else {
          logger.info(
            `${requestor.id}: ${requestor.username}#${requestor.discriminator} stopped LFG request: triggered word filter`,
          );
        }

        try {
          await msg.delete("LFG Request");
        } catch (error) {
          logger.error(
            `Failed to delete source message (${msg.id}). It was probably deleted already or we had a timeout`,
          );
          logger.error(error);
        }
      } else {
        regex = new RegExp("^" + cfg.lfg_unshrink_ident + "([^ß]|[ß])*$", "i");
        if (cfg.lfg_enable_shrink && msg.content.match(regex) != null) {
          const voice: VoiceChannel = this.bot.getChannel(requestor.voiceState.channelID) as VoiceChannel;
          regex = new RegExp("^([^ß]|[ß])*" + cfg.lfg_voice_ident + "([^ß]|[ß])*$", "i");
          if (voice.name.match(regex) != null) {
            if (voice.userLimit !== cfg.lfg_shrink_normal_amt) {
              try {
                voice.edit({ userLimit: cfg.lfg_shrink_normal_amt });
                text.createMessage("I have returned the channel to its normal capacity! " + requestor.mention);
              } catch (error) {
                logger.error(
                  `Ran into an error trying to unshrink channel (${voice.id}). Are we missing a permission?`,
                );
                logger.error(error);
              }
            } else {
              text.createMessage("Sorry, but that voice channel is already at normal capacity! " + requestor.mention);
            }
          } else {
            text.createMessage("Sorry, but you have to be in a LFG voice channel to unshrink! " + requestor.mention);
          }

          try {
            await msg.delete("Unshrink Request");
          } catch (error) {
            logger.error(
              `Failed to delete source message (${msg.id}). It was probably deleted already or we had a timeout`,
            );
            logger.error(error);
          }
        }
      }
    }
  }

  @d.event("voiceChannelLeave", "guild", true)
  async resetChannelLimitLeave(member: Member, vc: VoiceChannel): Promise<any> {
    const cfg: ILfgPluginConfig = this.getConfig();

    if (
      cfg.lfg_enable_shrink &&
      vc.voiceMembers.size === 0 &&
      vc.userLimit !== cfg.lfg_shrink_normal_amt &&
      vc.name.toLowerCase().includes(cfg.lfg_voice_ident)
    ) {
      vc.edit({ userLimit: cfg.lfg_shrink_normal_amt });
    }
  }

  @d.event("voiceChannelSwitch", "guild", true)
  async resetChannelLimitSwitch(member: Member, newVC: VoiceChannel, oldVC: VoiceChannel): Promise<any> {
    const cfg: ILfgPluginConfig = this.getConfig();

    if (
      cfg.lfg_enable_shrink &&
      oldVC.voiceMembers.size === 0 &&
      oldVC.userLimit !== cfg.lfg_shrink_normal_amt &&
      oldVC.name.toLowerCase().includes(cfg.lfg_voice_ident)
    ) {
      oldVC.edit({ userLimit: cfg.lfg_shrink_normal_amt });
    }
  }

  @d.command("delay")
  @d.permission("can_delay")
  async delayRequest(msg: Message): Promise<void> {
    if (this.delay.length > 1) {
      const highest: any = Math.round(Math.max(...this.delay));
      const lowest: any = Math.round(Math.min(...this.delay));
      const mean: any = Math.round(this.delay.reduce((t, v) => t + v, 0) / this.delay.length);

      msg.channel.createMessage(
        trimLines(`
      **LFG Delay:**
      Lowest: **${lowest}ms**
      Highest: **${highest}ms**
      Mean: **${mean}ms**
    `),
      );
    } else {
      this.sendErrorMessage(msg.channel, "No LFG requests yet, cannot display delays!");
    }

    logger.info(`${msg.author.id}: ${msg.author.username}#${msg.author.discriminator} Requested lfg delays`);
  }

  private async handleMessageCreation(vc: VoiceChannel, user: User, message: string, ranked: boolean): Promise<any> {
    const cfg: ILfgPluginConfig = this.getConfig();
    let channelInfo: string = null;
    const invite: Invite = await createInvite(vc);

    if (invite !== null) {
      if (cfg.lfg_message_compact) {
        channelInfo = user.mention;

        if (cfg.lfg_list_others) {
          const otherUsers: Eris.Collection<Member> = vc.voiceMembers;

          otherUsers.forEach((vcUser) => {
            if (vcUser.id !== user.id) {
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
        channelInfo = "Join " + user.mention;

        if (cfg.lfg_list_others) {
          const otherUsers: Eris.Collection<Member> = vc.voiceMembers;

          otherUsers.forEach((vcUser) => {
            if (vcUser.id !== user.id) {
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

  async shrinkChannel(voice: VoiceChannel, userMessage: string, cfg: ILfgPluginConfig): Promise<void> {
    if (cfg.lfg_enable_shrink) {
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

  private async updateDelayTime(start: any): Promise<void> {
    this.delay[this.current_pos] = performance.now() - start;
    this.current_pos++;
    if (this.current_pos >= 5) {
      this.current_pos = 0;
    }
  }
}

export async function createInvite(vc: VoiceChannel): Promise<Invite> {
  const existingInvites: Invite[] = await vc.getInvites();

  if (existingInvites.length !== 0) {
    return existingInvites[0];
  } else {
    return vc.createInvite(undefined);
  }
}
