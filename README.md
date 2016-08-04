# @bufferapp/logger

Provides logging standard middleware and functions.

Install the node package

    npm install @bufferapp/logger -SE

Use as middleware

    const logger = require('@bufferapp/logger/middleware');

    app = express();
    app.use(requestLogger());
    // ...other middleware and route handlers

