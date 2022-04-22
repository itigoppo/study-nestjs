import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifiedTodo1650593647711 implements MigrationInterface {
  name = 'modifiedTodo1650593647711';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`todo\` CHANGE \`description\` \`description\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`todo\` CHANGE \`description\` \`description\` text NOT NULL`,
    );
  }
}
