import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("blocks")
export class Block {
  @Column()
  @PrimaryColumn()
  id: string;

  @Column()
  guild_id: string;

  @Column()
  initiator_id: string;

  @Column()
  target_id: string;
}
