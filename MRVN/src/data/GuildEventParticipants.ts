import { getRepository, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { EventParticipant } from "./entities/EventParticipant";

export class GuildEventParticipants extends BaseGuildRepository {
  private allEventParticipants: Repository<EventParticipant>;

  constructor(guildId) {
    super(guildId);
    this.allEventParticipants = getRepository(EventParticipant);
  }

  async add(event_id: string, user_id: string, accepted: boolean) {
    await this.allEventParticipants.insert({
      guild_id: this.guildId,
      event_id,
      user_id,
      accepted,
    });
  }

  async deleteAllForEventId(event_id) {
    await this.allEventParticipants.delete({
      guild_id: this.guildId,
      event_id,
    });
  }
}
