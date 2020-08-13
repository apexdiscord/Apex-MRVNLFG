import { getRepository, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { NotifyRequest } from "./entities/NotifyRequest";

export class GuildNotifyRequests extends BaseGuildRepository {
  private allNotifies: Repository<NotifyRequest>;

  constructor(guildId) {
    super(guildId);
    this.allNotifies = getRepository(NotifyRequest);
  }

  async add(
    requestorId: string,
    userId: string,
    channelId: string,
    endTime: number,
    persist: boolean,
    active: boolean,
  ) {
    await this.allNotifies.insert({
      guild_id: this.guildId,
      requestor_id: requestorId,
      user_id: userId,
      channel_id: channelId,
      endTime,
      persist,
      active,
    });
  }

  async removeAllNotifiesForRequestorIdAndUserId(requestorId: string, userId: string) {
    await this.allNotifies.delete({
      guild_id: this.guildId,
      requestor_id: requestorId,
      user_id: userId,
    });
  }

  async removeAllUserNotifiesForUserId(userId: string) {
    await this.allNotifies.delete({
      guild_id: this.guildId,
      user_id: userId,
    });
  }

  async getAllForUserId(userId: string): Promise<NotifyRequest[]> {
    return this.allNotifies.find({
      guild_id: this.guildId,
      user_id: userId,
    });
  }
}
