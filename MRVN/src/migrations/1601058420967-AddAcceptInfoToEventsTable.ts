import { Column, MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAcceptInfoToEventsTable1601058420967 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.addColumn(
      "events",
      new TableColumn({
        name: "accept_info",
        type: "text",
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropColumn("events", "accept_info");
  }
}
