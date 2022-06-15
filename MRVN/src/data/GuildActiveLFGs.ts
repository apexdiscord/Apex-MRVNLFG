import { string } from "fp-ts";
import { DateTime } from "luxon";
import { getRepository, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { ActiveLFG } from "./entities/ActiveLFG";

export class GuildActiveLFGs extends BaseGuildRepository {
  private activeLfgs: Repository<ActiveLFG>;

  constructor(guildId) {
    super(guildId);
    this.activeLfgs = getRepository(ActiveLFG);
  }

  async add(voiceChannelId: string, textChannelId: string, messageId: string, userId: string) {
    await this.activeLfgs.insert({
      guild_id: this.guildId,
      voice_channel_id: voiceChannelId,
      text_channel_id: textChannelId,
      message_id: messageId,
      user_id: userId,
      created_at: DateTime.now().toMillis().toString(),
    });
  }

  async remove(voiceChannelId: string) {
    await this.activeLfgs.delete({
      guild_id: this.guildId,
      voice_channel_id: voiceChannelId,
    });
  }

  async removeForVoiceAndUser(voiceChannelId: string, userId: string) {
    await this.activeLfgs.delete({
      guild_id: this.guildId,
      voice_channel_id: voiceChannelId,
      user_id: userId,
    });
  }

  async findForVoiceAndUser(voiceChannelId: string, userId: string) {
    return this.activeLfgs.findOne({
      guild_id: this.guildId,
      voice_channel_id: voiceChannelId,
      user_id: userId,
    });
  }

  async findForUser(userId: string) {
    return this.activeLfgs.findOne({
      guild_id: this.guildId,
      user_id: userId,
    });
  }

  async findForVoice(voiceId: string) {
    return this.activeLfgs.findOne({
      guild_id: this.guildId,
      voice_channel_id: voiceId,
    });
  }

  async claim(voiceChannelId: string, newChannelId: string, newMessageId: string, newUserId: string) {
    await this.activeLfgs.update(
      {
        guild_id: this.guildId,
        voice_channel_id: voiceChannelId,
      },
      {
        user_id: newUserId,
        text_channel_id: newChannelId,
        message_id: newMessageId,
        claimable: false,
      },
    );
  }

  async setEnabled(voiceChannelId: string, userId: string, enabled: boolean) {
    await this.activeLfgs.update(
      {
        guild_id: this.guildId,
        voice_channel_id: voiceChannelId,
        user_id: userId,
      },
      { enabled },
    );
  }

  async setClaimable(voiceChannelId: string, userId: string, claimable: boolean) {
    await this.activeLfgs.update(
      {
        guild_id: this.guildId,
        voice_channel_id: voiceChannelId,
        user_id: userId,
      },
      { claimable },
    );
  }

  async deleteStale() {
    await this.activeLfgs
      .createQueryBuilder()
      .delete()
      .where("created_at <= :createdAt", { createdAt: DateTime.now().minus({ hours: 6 }).toMillis().toString() })
      .execute();
  }
}
