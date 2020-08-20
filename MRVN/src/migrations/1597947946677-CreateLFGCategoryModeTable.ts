import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateLFGCategoryModeTable1597947946677 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    queryRunner.createTable(
      new Table({
        name: "lfg_categories",
        columns: [
          {
            name: "id",
            type: "integer",
            isGenerated: true,
            generationStrategy: "increment",
            isPrimary: true,
          },
          {
            name: "guild_id",
            type: "text",
          },
          {
            name: "category_id",
            type: "text",
          },
        ],
        indices: [
          {
            columnNames: ["guild_id", "category_id"],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    queryRunner.dropTable("lfg_categories");
  }
}
