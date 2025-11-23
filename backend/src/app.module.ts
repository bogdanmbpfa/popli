import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { config } from '@config';
import { Controllers } from '@controllers';
import { CacheControlMiddleware, RequestLoggerMiddleware } from '@middlewares';
import { Services } from '@services';
import { UtilityServices } from '@utilities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [() => config] }),
    HttpModule.register({
      timeout: 10000,
    }),
  ],
  controllers: Controllers,
  providers: [...Services, ...UtilityServices],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CacheControlMiddleware, RequestLoggerMiddleware)
      .forRoutes('*');
  }
}
