import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("modban")
export class Modban {
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
