import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("scaling_categories")
export class ScalingCategory {
  @Column()
  @PrimaryColumn()
  id: number;

  @Column() guild_id: string;

  @Column() category_id: string;
}
