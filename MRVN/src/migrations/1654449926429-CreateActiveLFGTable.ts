import { Column, MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateActiveLFGTable1654449926429 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(
      new Table({
        name: "active_lfg",
        columns: [
          {
            name: "message_id",
            type: "bigint",
            isPrimary: true,
            isNullable: false,
            unsigned: true,
          },
          {
            name: "guild_id",
            type: "bigint",
            isNullable: false,
            unsigned: true,
          },
          {
            name: "voice_channel_id",
            type: "bigint",
            isNullable: false,
            unsigned: true,
          },
          {
            name: "text_channel_id",
            type: "bigint",
            isNullable: false,
            unsigned: true,
          },
          {
            name: "user_id",
            type: "bigint",
            isNullable: false,
            unsigned: true,
          },
          {
            name: "enabled",
            type: "boolean",
            default: true,
          },
          {
            name: "claimable",
            type: "boolean",
            default: false,
          },
          {
            name: "created_at",
            type: "bigint",
          },
        ],
      }),
    );

    queryRunner.createIndices("active_lfg", [
      new TableIndex({
        columnNames: ["voice_channel_id", "user_id"],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable("active_lfg");
  }
}
