import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("active_lfg")
export class ActiveLFG {
  @Column()
  @PrimaryColumn()
  message_id: string;

  @Column()
  guild_id: string;

  @Column()
  voice_channel_id: string;

  @Column()
  text_channel_id: string;

  @Column()
  user_id: string;

  @Column()
  enabled: boolean;

  @Column()
  claimable: boolean;

  @Column()
  created_at: string;
}
