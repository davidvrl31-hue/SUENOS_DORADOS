import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validaciones automáticas con class-validator en todos los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // elimina campos no declarados en el DTO
      forbidNonWhitelisted: false,
      transform: true,       // transforma tipos automáticamente
    }),
  );

  // CORS para Next.js y aplicaciones móviles
  app.enableCors({
    origin: true, // acepta cualquier origen — ideal para desarrollo
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API corriendo en http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
