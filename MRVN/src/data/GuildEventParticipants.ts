import { getRepository, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { EventParticipant } from "./entities/EventParticipant";
import { NumberType } from "io-ts";

export class GuildEventParticipants extends BaseGuildRepository {
  private allEventParticipants: Repository<EventParticipant>;

  constructor(guildId) {
    super(guildId);
    this.allEventParticipants = getRepository(EventParticipant);
  }

  async add(event_id: number, user_id: string, request_message_id: string, accepted: boolean) {
    await this.allEventParticipants.insert({
      guild_id: this.guildId,
      event_id,
      user_id,
      request_message_id,
      accepted,
    });
  }

  async deleteAllForEventId(event_id) {
    await this.allEventParticipants.delete({
      guild_id: this.guildId,
      event_id,
    });
  }

  async getByRequestId(request_message_id: string): Promise<EventParticipant> {
    return this.allEventParticipants.findOne({
      guild_id: this.guildId,
      request_message_id,
      accepted: null,
    });
  }

  async getByEventAndUserId(event_id: number, user_id: string) {
    return this.allEventParticipants.findOne({
      guild_id: this.guildId,
      event_id,
      user_id,
    });
  }

  async setAcceptedForEventIdAndUserId(event_id: number, user_id: string, accepted: boolean) {
    await this.allEventParticipants.update({
      guild_id: this.guildId,
      event_id,
      user_id,
    }, {
      accepted,
    });
  }

  async getAllForEventId(event_id: number) {
    return this.allEventParticipants.find({
      guild_id: this.guildId,
      event_id,
    })
  }
}
