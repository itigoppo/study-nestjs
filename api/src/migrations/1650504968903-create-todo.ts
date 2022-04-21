import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTodo1650504968903 implements MigrationInterface {
  name = 'createTodo1650504968903';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`todo\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(100) NOT NULL, \`description\` text NOT NULL, \`completed_at\` datetime(0) NULL, \`created_at\` datetime(0) NOT NULL, \`updated_at\` datetime(0) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`todo\``);
  }
}
