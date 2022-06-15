import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateKickBlockCounterTable1654478379554 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(
      new Table({
        name: "kick_block_counter",
        columns: [
          {
            name: "guild_id",
            type: "bigint",
          },
          {
            name: "target_id",
            type: "bigint",
            isPrimary: true,
          },
          {
            name: "count",
            type: "int",
            unsigned: true,
          },
          {
            name: "last_updated",
            type: "bigint",
          },
        ],
      }),
    );

    queryRunner.createIndices("kick_block_counter", [
      new TableIndex({
        columnNames: ["initiatior_id"],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable("kick_block_counter");
  }
}
