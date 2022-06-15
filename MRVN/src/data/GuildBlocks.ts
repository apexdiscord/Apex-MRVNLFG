import { string } from "fp-ts";
import { getRepository, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { ActiveLFG } from "./entities/ActiveLFG";
import { Block } from "./entities/Block";

export class GuildBlocks extends BaseGuildRepository {
  private blocks: Repository<Block>;

  constructor(guildId) {
    super(guildId);
    this.blocks = getRepository(Block);
  }

  async add(initiatiorId: string, targetId: string) {
    await this.blocks.insert({
      guild_id: this.guildId,
      initiator_id: initiatiorId,
      target_id: targetId,
    });
  }

  async remove(initiatiorId: string, targetId: string) {
    await this.blocks.delete({
      guild_id: this.guildId,
      initiator_id: initiatiorId,
      target_id: targetId,
    });
  }

  async findForInitiatorAndTarget(initiatiorId: string, targetId: string) {
    return this.blocks.findOne({
      guild_id: this.guildId,
      initiator_id: initiatiorId,
      target_id: targetId,
    });
  }

  async isBlockInEitherDirection(firstId: string, secondId: string) {
    const firstInitiator = await this.blocks.findOne({
      guild_id: this.guildId,
      initiator_id: firstId,
      target_id: secondId,
    });

    const firstTarget = await this.blocks.findOne({
      guild_id: this.guildId,
      initiator_id: secondId,
      target_id: firstId,
    });

    if (firstInitiator) return 1;
    if (firstTarget) return 2;
    return 0;
  }

  async findAllByInitiator(initiatiorId: string) {
    return this.blocks.find({
      guild_id: this.guildId,
      initiator_id: initiatiorId,
    });
  }
}
