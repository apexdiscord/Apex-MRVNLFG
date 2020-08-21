import { getRepository, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { ScalingUnhide } from "./entities/ScalingUnhide";

export class GuildScalingUnhides extends BaseGuildRepository {
  private allScalingUnhides: Repository<ScalingUnhide>;

  constructor(guildId) {
    super(guildId);
    this.allScalingUnhides = getRepository(ScalingUnhide);
  }

  async add(category_id: string, unhider_id: string, minimum_until: number) {
    await this.allScalingUnhides.insert({
      guild_id: this.guildId,
      category_id,
      unhider_id,
      minimum_until,
    });
  }

  async remove(id: number) {
    await this.allScalingUnhides.delete({
      guild_id: this.guildId,
      id,
    });
  }

  async getAllScalingUnhides() {
    return this.allScalingUnhides.find({
      guild_id: this.guildId,
    });
  }

  async getForCategoryId(category_id: string) {
    return this.allScalingUnhides.findOne({
      guild_id: this.guildId,
      category_id,
    });
  }
}
