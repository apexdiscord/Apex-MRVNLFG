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
    accept_info: string,
    startTime: number,
    active: boolean,
    open: boolean,
    vc_visible: boolean,
  ) {
    await this.allEvents.insert({
      guild_id: this.guildId,
      creator_id,
      voice_id,
      announce_id,
      title,
      description,
      accept_info,
      startTime,
      active,
      open,
      vc_visible,
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

  async findByEventId(id: number, active: boolean): Promise<Event> {
    return this.allEvents.findOne({
      guild_id: this.guildId,
      id,
      active,
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

  async markEventOpen(id: number) {
    await this.allEvents.update(
      {
        guild_id: this.guildId,
        id,
      },
      {
        open: true,
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

  async getEventForAnnounceId(announce_id: string) {
    return this.allEvents.findOne({
      guild_id: this.guildId,
      announce_id,
      active: true,
    });
  }

  async markVcPublic(event_id: number) {
    await this.allEvents.update(
      {
        guild_id: this.guildId,
        id: event_id,
      },
      {
        vc_visible: true,
      },
    );
  }
}
