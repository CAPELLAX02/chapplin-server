import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { config, database, up } from 'migrate-mongo';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DbMigrationService implements OnModuleInit {
  private readonly dbMigrationConfig: Partial<config.Config> = {
    mongodb: {
      databaseName: this.configService.getOrThrow('DB_NAME'),
      url: this.configService.getOrThrow('MONGODB_URI'),
    },
    migrationsDir: path.join(__dirname, '../../migrations'),
    changelogCollectionName: 'changelog',
    migrationFileExtension: '.js',
  };

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.ensureMigrationsDirExists();
    config.set(this.dbMigrationConfig);
    const { db, client } = await database.connect();
    await up(db, client);
  }

  private ensureMigrationsDirExists() {
    const dir = this.dbMigrationConfig.migrationsDir as string;
    if (!fs.existsSync(dir)) {
      throw new Error(`Migrations directory does not exist: ${dir}`);
    }
  }
}
