import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Fun App APIS')
    .setDescription(
      'Complete Api documentation for fun app',
    )
    .setVersion('1.0')
    .addServer(
      'http://localhost:3000/',
      'Local environment',
    )
    .addTag('Your API Tag')
    .build();

  const document = SwaggerModule.createDocument(
    app,
    options,
  );
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();
