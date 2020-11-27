import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddEventPingIDToEventTable1606443366122 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.addColumn(
      "events",
      new TableColumn({
        name: "ping_message_id",
        type: "text",
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("events", "ping_message_id");
  }
}
