import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Servir archivos estáticos de uploads/ en la ruta /uploads
  // Accesible desde móvil y web como: http://servidor:3000/uploads/productos/imagen.jpg
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

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

  // ── Seeding: garantiza roles y usuario administrador por defecto ──
  // Se ejecuta siempre al arrancar. Si el admin ya existe, no hace nada.
  try {
    const authService = app.get(AuthService);
    const resultado = await authService.initAdmin();
    console.log(`✅ Seed admin: ${resultado.mensaje} (${resultado.correo})`);
  } catch (err) {
    console.error('⚠️  Error al inicializar el admin por defecto:', err);
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API corriendo en http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
