import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);

    app.enableCors();
    app.setGlobalPrefix('v1');

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}/v1`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Application bootstrap failed: ${message}`);
    process.exit(1);
  }
}
bootstrap();
