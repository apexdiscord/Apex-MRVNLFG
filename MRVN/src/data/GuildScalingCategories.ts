import { getRepository, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { ScalingCategory } from "./entities/ScalingCategory";

export class GuildScalingCategories extends BaseGuildRepository {
  private allScalingCategories: Repository<ScalingCategory>;

  constructor(guildId) {
    super(guildId);
    this.allScalingCategories = getRepository(ScalingCategory);
  }

  async add(category_id: string) {
    await this.allScalingCategories.insert({
      guild_id: this.guildId,
      category_id,
    });
  }

  async remove(category_id: string) {
    await this.allScalingCategories.delete({
      guild_id: this.guildId,
      category_id,
    });
  }

  async getScalingCategory(category_id: string) {
    return this.allScalingCategories.findOne({
      guild_id: this.guildId,
      category_id,
    });
  }

  async getAllScalingCategories() {
    return this.allScalingCategories.find({
      guild_id: this.guildId,
    });
  }
}
