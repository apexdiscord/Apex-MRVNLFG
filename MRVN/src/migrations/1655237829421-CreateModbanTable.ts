import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateModbanTable1655237829421 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(
      new Table({
        name: "modban",
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

    queryRunner.createIndices("modban", [
      new TableIndex({
        columnNames: ["target_id"],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable("modban");
  }
}
