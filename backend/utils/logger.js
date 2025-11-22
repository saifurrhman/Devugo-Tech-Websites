const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry);
  }

  writeLog(filename, message) {
    const logFile = path.join(this.logDir, filename);
    fs.appendFileSync(logFile, message + '\n');
  }

  info(message, data = null) {
    const log = this.formatMessage('INFO', message, data);
    console.log(log);
    this.writeLog('info.log', log);
  }

  error(message, data = null) {
    const log = this.formatMessage('ERROR', message, data);
    console.error(log);
    this.writeLog('error.log', log);
  }

  warn(message, data = null) {
    const log = this.formatMessage('WARN', message, data);
    console.warn(log);
    this.writeLog('warn.log', log);
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      const log = this.formatMessage('DEBUG', message, data);
      console.log(log);
      this.writeLog('debug.log', log);
    }
  }
}

module.exports = new Logger();  