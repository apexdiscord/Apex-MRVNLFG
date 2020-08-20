import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("event_participants")
export class EventParticipant {
  @Column()
  @PrimaryColumn()
  id: number;

  @Column() guild_id: string;

  @Column() event_id: number;

  @Column() user_id: string;

  @Column() request_message_id: string;

  @Column() accepted: boolean;
}
