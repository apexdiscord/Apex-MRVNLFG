import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("notify_requests")
export class NotifyRequest {
  @Column()
  @PrimaryColumn()
  id: number;

  @Column() guild_id: string;

  @Column() requestor_id: string;

  @Column() user_id: string;

  @Column() channel_id: string;

  @Column() endTime: number;

  @Column() persist: boolean;

  @Column() active: boolean;
}
