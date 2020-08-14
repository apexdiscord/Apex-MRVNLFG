import { getRepository, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { Event } from "./entities/Event";

export class GuildEvents extends BaseGuildRepository {
  private allEvents: Repository<Event>;

  constructor(guildId) {
    super(guildId);
    this.allEvents = getRepository(Event);
  }

  async add(
    creator_id: string,
    voice_id: string,
    announce_id: string,
    title: string,
    description: string,
    startTime: number,
    maxUsers: number,
    active: boolean,
    open: boolean,
  ) {
    await this.allEvents.insert({
      guild_id: this.guildId,
      creator_id,
      voice_id,
      announce_id,
      title,
      description,
      startTime,
      maxUsers,
      active,
      open,
    });
  }

  async getAll(active: boolean = true) {
    if (active) {
      return this.allEvents.find({
        guild_id: this.guildId,
        active,
      });
    } else {
      return this.allEvents.find({
        guild_id: this.guildId,
      });
    }
  }

  async activeEventAmount(): Promise<number> {
    const active = await this.allEvents.find({
      guild_id: this.guildId,
      active: true,
    });

    return active.length;
  }

  async highestEventId(): Promise<number> {
    const max = (await this.allEvents.createQueryBuilder().select("MAX(id)", "max").getRawOne()).max;
    return max == null ? 0 : max;
  }

  async findByEventId(id: number): Promise<Event> {
    return this.allEvents.findOne({
      guild_id: this.guildId,
      id,
    });
  }

  async markEventClosed(id: number) {
    await this.allEvents.update(
      {
        guild_id: this.guildId,
        id,
      },
      {
        open: false,
      },
    );
  }

  async markEventDeleted(id: number) {
    await this.allEvents.update(
      {
        guild_id: this.guildId,
        id,
      },
      {
        active: false,
      },
    );
  }
}
