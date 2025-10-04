const express = require("express");
const morgan = require("morgan");
const auth = require("basic-auth");
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const clicksLogPath = path.join(__dirname, "logs", "clicks.log");
const clicksLogStream = fs.createWriteStream(clicksLogPath, { flags: "a" });
// Ensure logs folder exists
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const app = express();
app.use(express.json());
app.use(morgan("dev"));

// Basic auth middleware
const adminUser = { name: "admin", pass: "secret" };
function checkAuth(req, res, next) {
  const credentials = auth(req);
  if (!credentials || credentials.name !== adminUser.name || credentials.pass !== adminUser.pass) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// DLQ logging
function logToDLQ(event, reason) {
  const logEntry = {
    event,
    reason,
    timestamp: new Date().toISOString()
  };
  const dlqPath = path.join(__dirname, "dlq", "dlq.log");
  fs.appendFile(dlqPath, JSON.stringify(logEntry) + "\n", (err) => {
    if (err) console.error("DLQ write error:", err);
  });
}

// Schema validation
const ajv = new Ajv();
addFormats(ajv);
const clickEventSchema = require("./schemas/clickEventSchema.json");
const validateClickEvent = ajv.compile(clickEventSchema);

// Store processed correlation IDs (for idempotency)
const processedEvents = new Set();

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Click events
app.post("/events/click", checkAuth, (req, res) => {
  const valid = validateClickEvent(req.body);
  if (!valid) {
    logToDLQ(req.body, validateClickEvent.errors);
    return res.status(400).json({ error: validateClickEvent.errors });
  }

  const { correlation_id } = req.body;

  if (processedEvents.has(correlation_id)) {
    return res.json({ message: "Duplicate ignored" });
  }

  processedEvents.add(correlation_id);
  console.log("Received click event:", req.body);

  // ✅ Write valid click event to clicks.log
  clicksLogStream.write(
    JSON.stringify({ ...req.body, logged_at: new Date().toLocaleString() }) + "\n"
  );

  res.json({ message: "Event accepted" });
});


// Telemetry events
app.post("/telemetry", checkAuth, (req, res) => {
  console.log("Received telemetry:", req.body);
  res.json({ message: "Telemetry accepted" });
});

// Start server only if not in test mode
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
