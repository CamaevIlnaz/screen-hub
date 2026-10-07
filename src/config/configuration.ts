export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    swaggerPath: process.env.SWAGGER_PATH ?? 'docs',
    cookieName: process.env.COOKIE_NAME ?? 'access_token',
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    uploadsDir: process.env.UPLOADS_DIR ?? 'uploads',
    publicDir: process.env.PUBLIC_DIR ?? 'public',
  },
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
});
