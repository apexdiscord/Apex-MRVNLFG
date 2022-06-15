import { getRepository, Repository } from "typeorm";
import { BaseGuildRepository } from "./BaseGuildRepository";
import { Modban } from "./entities/Modban";

export class GuildModbans extends BaseGuildRepository {
  private modbans: Repository<Modban>;

  constructor(guildId) {
    super(guildId);
    this.modbans = getRepository(Modban);
  }

  async add(initiatiorId: string, targetId: string) {
    await this.modbans.insert({
      guild_id: this.guildId,
      initiator_id: initiatiorId,
      target_id: targetId,
    });
  }

  async remove(initiatiorId: string, targetId: string) {
    await this.modbans.delete({
      guild_id: this.guildId,
      initiator_id: initiatiorId,
      target_id: targetId,
    });
  }

  async findForInitiatorAndTarget(initiatiorId: string, targetId: string) {
    return this.modbans.findOne({
      guild_id: this.guildId,
      initiator_id: initiatiorId,
      target_id: targetId,
    });
  }

  async isBanned(userId: string) {
    const banned = await this.modbans.findOne({
      guild_id: this.guildId,
      target_id: userId,
    });

    if (banned) return true;
    return false;
  }

  async findAllByInitiator(initiatiorId: string) {
    return this.modbans.find({
      guild_id: this.guildId,
      initiator_id: initiatiorId,
    });
  }
}
