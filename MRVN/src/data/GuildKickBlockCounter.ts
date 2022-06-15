import { DateTime } from "luxon";
import { getRepository, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { Block } from "./entities/Block";
import { KickBlockCounter } from "./entities/KickBlockCounter";

export class GuildKickBlockCounter extends BaseGuildRepository {
  private kickBlockCounter: Repository<KickBlockCounter>;

  constructor(guildId) {
    super(guildId);
    this.kickBlockCounter = getRepository(KickBlockCounter);
  }

  async set(targetId: string, count: number) {
    await this.kickBlockCounter.save({
      guild_id: this.guildId,
      target_id: targetId,
      count,
      last_updated: DateTime.now().toMillis().toString(),
    });
  }

  async remove(targetId: string) {
    await this.kickBlockCounter.delete({
      guild_id: this.guildId,
      target_id: targetId,
    });
  }

  async find(targetId: string) {
    return this.kickBlockCounter.findOne({
      guild_id: this.guildId,
      target_id: targetId,
    });
  }

  async deleteOld() {
    await this.kickBlockCounter
      .createQueryBuilder()
      .delete()
      .where("last_updated <= :lastUpdated", { lastUpdated: DateTime.now().minus({ hours: 24 }).toMillis().toString() })
      .execute();
  }
}
