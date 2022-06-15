import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateBlockTable1654462992897 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(
      new Table({
        name: "blocks",
        columns: [
          {
            name: "id",
            type: "int",
            isGenerated: true,
            isPrimary: true,
            isNullable: false,
            generationStrategy: "increment",
          },
          {
            name: "guild_id",
            type: "bigint",
          },
          {
            name: "initiator_id",
            type: "bigint",
          },
          {
            name: "target_id",
            type: "bigint",
          },
        ],
      }),
    );

    queryRunner.createIndices("blocks", [
      new TableIndex({
        columnNames: ["initiatior_id", "target_id"],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable("blocks");
  }
}
