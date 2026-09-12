/**
 * seed.ts — Script de seeding independiente para Sueños Dorados API
 *
 * Crea los roles base y el usuario administrador por defecto si no existen.
 * Úsalo cuando necesites inicializar o restablecer la BD sin arrancar la API completa.
 *
 * Ejecución:
 *   npx ts-node -r tsconfig-paths/register src/seed.ts
 *
 * O compilado:
 *   node dist/seed.js
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function runSeed() {
  console.log('🌱 Iniciando seed de Sueños Dorados...');

  // Levanta el contexto de NestJS sin servidor HTTP
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const authService = app.get(AuthService);
    const resultado = await authService.initAdmin();

    console.log('─────────────────────────────────────');
    console.log(`✅ ${resultado.mensaje}`);
    console.log(`   Correo   : ${resultado.correo}`);
    if (resultado.contrasena) {
      console.log(`   Contraseña: ${resultado.contrasena}`);
    }
    console.log('─────────────────────────────────────');
  } catch (err) {
    console.error('❌ Error durante el seed:', err);
    process.exit(1);
  } finally {
    await app.close();
  }

  console.log('🌱 Seed completado.');
  process.exit(0);
}

runSeed();
