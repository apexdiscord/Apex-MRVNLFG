import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateLfgLinkAndContextTables1598913283755 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    queryRunner.createTable(
      new Table({
        name: "lfg_links",
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
            name: "link",
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
        name: "lfg_context",
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
            name: "messageIncludes",
            type: "text",
          },
          {
            name: "context",
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
    queryRunner.dropTable("lfg_links");
    queryRunner.dropTable("lfg_context");
  }
}
