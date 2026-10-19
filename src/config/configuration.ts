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
  sftp: {
    enabled: process.env.SFTP_ENABLED === 'true',
    host: process.env.SFTP_HOST,
    port: Number(process.env.SFTP_PORT ?? 22),
    username: process.env.SFTP_USERNAME,
    privateKeyPath: process.env.SFTP_PRIVATE_KEY_PATH,
    passphrase: process.env.SFTP_PASSPHRASE,
    root: process.env.SFTP_ROOT,
    readyTimeout: Number(process.env.SFTP_READY_TIMEOUT_MS ?? 20000),
  },
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  figma: {
    tokenSettingKey: process.env.FIGMA_TOKEN_SETTING_KEY ?? 'figma.token',
    syncTime: process.env.FIGMA_SYNC_TIME ?? '03:00',
  },
});
