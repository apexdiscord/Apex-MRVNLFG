import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("events")
export class Event {
  @Column()
  @PrimaryColumn()
  id: number;

  @Column() guild_id: string;

  @Column() creator_id: string;

  @Column() voice_id: string;

  @Column() announce_id: string;

  @Column() title: string;

  @Column() description: string;

  @Column() accept_info: string;

  @Column() startTime: number;

  @Column() active: boolean;

  @Column() open: boolean;

  @Column() vc_visible: boolean;
}
