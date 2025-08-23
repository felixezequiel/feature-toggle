import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Habilitar CORS para o frontend
    app.enableCors({
        origin: 'http://localhost:5173', // Vite default port
        credentials: true,
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Backend rodando na porta ${port}`);
    console.log(`🔗 URL: http://localhost:${port}`);
}
bootstrap();
