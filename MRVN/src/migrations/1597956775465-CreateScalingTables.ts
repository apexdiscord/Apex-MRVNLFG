import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateScalingTables1597956775465 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    queryRunner.createTable(
      new Table({
        name: "scaling_categories",
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

    queryRunner.createTable(
      new Table({
        name: "scaling_unhides",
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
          {
            name: "unhider_id",
            type: "text",
          },
          {
            name: "minimum_until",
            type: "integer",
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
    queryRunner.dropTable("scaling_categories");
    queryRunner.dropTable("scaling_unhides");
  }
}
