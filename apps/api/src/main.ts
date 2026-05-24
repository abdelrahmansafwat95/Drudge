import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    /\.vercel\.app$/,
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((o) =>
        typeof o === 'string' ? o === origin : o.test(origin),
      );
      callback(null, allowed || process.env.NODE_ENV === 'development');
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('PestControl Pro API')
    .setDescription('Enterprise Pest Control Operations Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.API_PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API: http://localhost:${port}/api/v1`);
  console.log(`📚 Docs: http://localhost:${port}/api/docs`);
  console.log(`✅ DB connected`);
}

bootstrap();
