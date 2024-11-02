

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function start() {
  const PORT = process.env.PORT || 3002;
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Убирает поля, которых нет в DTO
    forbidNonWhitelisted: true,  // Бросает ошибку, если есть лишние поля
    transform: true,  // Автоматически преобразует примитивные типы
  }));

  app.enableCors({
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // если необходимо передавать куки
  });

  const config = new DocumentBuilder()
    .setTitle('ThemeChestBack')
    .setDescription('Документация REST API')
    .setVersion('1.0.0')
    .build()

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(PORT, () => console.log(`Server run = ${PORT}`));
}

start();
