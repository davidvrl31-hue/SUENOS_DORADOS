import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

/**
 * Global: true — el Gateway está disponible en todos los módulos
 * sin necesidad de importarlo explícitamente en cada uno.
 */
@Global()
@Module({
  providers: [EventsGateway],
  exports:   [EventsGateway],
})
export class EventsModule {}
