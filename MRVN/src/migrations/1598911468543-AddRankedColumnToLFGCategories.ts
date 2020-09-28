import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRankedColumnToLFGCategories1598911468543 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    queryRunner.addColumn(
      "lfg_categories",
      new TableColumn({
        name: "ranked",
        type: "boolean",
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    queryRunner.dropColumn("lfg_categories", "ranked");
  }
}
