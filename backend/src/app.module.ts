import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeatureFlagModule } from './feature-flag/feature-flag.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        FeatureFlagModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
