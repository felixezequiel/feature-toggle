import { Controller, Get, Sse, MessageEvent, Query, Param, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FeatureFlagService, FeatureFlagEvent, SSEEvent } from './feature-flag.service';

@Controller('feature-flags')
export class FeatureFlagController {
  constructor(private featureFlagService: FeatureFlagService) { }

  @Get()
  getFeatureFlags() {
    return this.featureFlagService.getFeatureFlags();
  }

  @Get('check/:name')
  isEnabled(
    @Param('name') name: string,
    @Query('userId') userId?: string,
    @Query('email') email?: string,
    @Query('environment') environment?: string
  ) {
    const userContext: any = {};
    if (userId) userContext.userId = userId;
    if (email) userContext.email = email;
    if (environment) userContext.environment = environment;

    const finalContext = Object.keys(userContext).length > 0 ? userContext : undefined;

    return {
      name,
      enabled: this.featureFlagService.isEnabled(name, finalContext),
      variant: this.featureFlagService.getVariant(name, finalContext)
    };
  }

  @Sse('events')
  featureFlagEvents(): Observable<SSEEvent> {
    return this.featureFlagService.getFeatureFlagEvents();
  }

  // Endpoint de teste para emitir evento manualmente
  @Post('test-event')
  testEvent() {
    this.featureFlagService.emitTestEvent();
    return { message: 'Evento de teste emitido' };
  }

  // Endpoint para emitir heartbeat manual
  @Post('heartbeat')
  emitHeartbeat() {
    this.featureFlagService.emitHeartbeat();
    return { message: 'Heartbeat emitido' };
  }

  // Endpoint para verificar status da conexão SSE
  @Get('status')
  getStatus() {
    return {
      status: 'active',
      timestamp: new Date().toISOString(),
      message: 'Feature Flag Service ativo e funcionando'
    };
  }
}