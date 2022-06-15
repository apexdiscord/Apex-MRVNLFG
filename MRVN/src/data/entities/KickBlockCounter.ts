import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("kick_block_counter")
export class KickBlockCounter {
  @Column()
  guild_id: string;

  @Column()
  @PrimaryColumn()
  target_id: string;

  @Column()
  count: number;

  @Column()
  last_updated: string;
}
