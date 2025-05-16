import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCertificate1747365505147 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "certificates",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "publication_date",
            type: "date",
            isNullable: true,
          },
          {
            name: "publication_page",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "certificate_number",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "second_issue",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "book",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "book_page",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "enrollment_start",
            type: "date",
            isNullable: true,
          },
          {
            name: "enrollment_end",
            type: "date",
            isNullable: true,
          },
          {
            name: "process_number",
            type: "varchar",
            isNullable: true,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("certificates");
  }
}
