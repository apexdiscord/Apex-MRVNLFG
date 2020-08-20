import { getRepository, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { LfgCategory } from "./entities/LfgCategory";

export class GuildLfgCategories extends BaseGuildRepository {
  private allLfgCategories: Repository<LfgCategory>;

  constructor(guildId) {
    super(guildId);
    this.allLfgCategories = getRepository(LfgCategory);
  }

  async add(category_id: string) {
    await this.allLfgCategories.insert({
      guild_id: this.guildId,
      category_id,
    });
  }

  async remove(category_id: string) {
    await this.allLfgCategories.delete({
      guild_id: this.guildId,
      category_id,
    });
  }

  async getLfgCategory(category_id: string) {
    return this.allLfgCategories.findOne({
      guild_id: this.guildId,
      category_id,
    });
  }

  async getAllLfgCategories() {
    return this.allLfgCategories.find({
      guild_id: this.guildId,
    });
  }
}
