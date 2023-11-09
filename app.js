const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const rateLimit = require('express-rate-limit');

require("dotenv").config({ path: "./.env" });
const connectDb = require("./utils/connectDB");

connectDb();


const app = express();
const port = 3000;

app.use(express.json());

// Configure rate limiting (limiting to 100 requests per hour from a single IP address)
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 100 requests per hour
    handler: (req, res) => {
      res.status(429).json({ "status": "error", message: 'Too Many Requests' });
    },
  });

// API Enpoints
app.use("/", require("./routes/index"));
app.use("/register", limiter, require("./routes/register"));
app.use("/login", limiter, require("./routes/login"));
app.use("/reset", limiter, require("./routes/reset"));
app.use("/profile", limiter, require("./routes/profile"));
app.use("/verify", limiter, require("./routes/verify"));
app.use("/email", limiter, require("./routes/email"));


// Swagger definition
const swaggerDefinition = {
    info: {
      title: 'Web API',
      version: '1.0.0',
      description: 'Documentation for Web API',
    },
    basePath: '/',
    securityDefinitions: {
      BearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'JWT Bearer Token',
      },
    },
  };

// Options for the swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // Replace with the actual path to your API files
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});