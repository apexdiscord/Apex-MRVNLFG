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

  @Column() startTime: number;

  @Column() maxUsers: number;

  @Column() active: boolean;

  @Column() open: boolean;
}
