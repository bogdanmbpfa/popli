import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { config } from '@config';
import { Controllers } from '@controllers';
import { CacheControlMiddleware, RequestLoggerMiddleware } from '@middlewares';
import { EQueueName } from '@resources';
import { Services } from '@services';
import { UtilityServices } from '@utilities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [() => config] }),
    HttpModule.register({
      timeout: 10000,
    }),
    BullModule.forRoot({
      connection: {
        host: config.queue.host,
        port: config.queue.port,
        password: config.queue.password,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    }),
    BullModule.registerQueue({
      name: EQueueName.CLICK,
    }),
    ScheduleModule.forRoot(),
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
