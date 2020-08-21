import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("scaling_unhides")
export class ScalingUnhide {
  @Column()
  @PrimaryColumn()
  id: number;

  @Column() guild_id: string;

  @Column() category_id: string;

  @Column() unhider_id: string;

  @Column() minimum_until: number;
}
