import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateNotifyTable1597067610919 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    queryRunner.createTable(
      new Table({
        name: "notify_requests",
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
            name: "requestor_id",
            type: "text",
          },
          {
            name: "user_id",
            type: "text",
          },
          {
            name: "channel_id",
            type: "text",
          },
          {
            name: "endTime",
            type: "bigint",
          },
          {
            name: "persist",
            type: "boolean",
          },
          {
            name: "active",
            type: "boolean",
          },
        ],
        indices: [
          {
            columnNames: ["guild_id", "user_id"],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    queryRunner.dropTable("notify_requests");
  }
}
