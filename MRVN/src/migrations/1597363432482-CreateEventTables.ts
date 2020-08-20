import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateEventTables1597363432482 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    queryRunner.createTable(
      new Table({
        name: "events",
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
            name: "creator_id",
            type: "text",
          },
          {
            name: "announce_id",
            type: "text",
          },
          {
            name: "voice_id",
            type: "text",
          },
          {
            name: "title",
            type: "text",
          },
          {
            name: "description",
            type: "text",
          },
          {
            name: "startTime",
            type: "bigint",
          },
          {
            name: "active",
            type: "boolean",
          },
          {
            name: "open",
            type: "boolean",
          },
          {
            name: "vc_visible",
            type: "boolean",
          }
        ],
      }),
    );

    queryRunner.createTable(
      new Table({
        name: "event_participants",
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
            name: "event_id",
            type: "integer",
          },
          {
            name: "user_id",
            type: "text",
          },
          {
            name: "request_message_id",
            type: "text",
            isNullable: true,
          },
          {
            name: "accepted",
            type: "boolean",
            isNullable: true,
            default: null,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    queryRunner.dropTable("events");
    queryRunner.dropTable("event_participants");
  }
}
