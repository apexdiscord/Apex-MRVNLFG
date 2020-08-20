import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("lfg_categories")
export class LfgCategory {
  @Column()
  @PrimaryColumn()
  id: number;

  @Column() guild_id: string;

  @Column() category_id: string;
}
