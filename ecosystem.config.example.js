// Example PM2 ecosystem configuration
// Copy this to ecosystem.config.js and adjust as needed

module.exports = {
  apps: [{
    name: 'rightstayafrica',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/rightstayafrica',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G', // Increased for image processing
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Increase Node.js memory limit for image optimization
      NODE_OPTIONS: '--max-old-space-size=2048'
    },
    // Logging
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
