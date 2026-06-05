module.exports = {
  apps: [
    {
      name: "kuray-dev",
      cwd: __dirname,
      script: "npm",
      args: "start",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000
        // Hassas değişkenler (DATABASE_URL, REDIS_URL vb.) sunucudaki .env dosyasında tutulur
      }
    }
  ]
};
