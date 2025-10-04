To run this make sure express is installed
cd into this directory (/event-api) through cmd, then:
    npm install
to run the tests, do
    npm test
to manually test and see how the code works, run
    npm start
then in another cmd, you can test it by sending curl requests

Cheatsheet for curl requests

Health check (no auth required)
    curl -X GET http://localhost:3000/health
Expected:
    { "status": "ok" }

---

Click events
Authorized (valid payload → should be accepted)
    curl -X POST http://localhost:3000/events/click -u admin:secret -H "Content-Type: application/json" -d "{\"correlation_id\":\"abc123\",\"sku_id\":\"SKU1\",\"track_id\":\"TRACK1\",\"device_id\":\"DEVICE1\",\"ts\":\"2025-10-03T00:00:00.000Z\"}"
Expected:
    { "message": "Event accepted" }

Unauthorized (wrong password → rejected)
    curl -X POST http://localhost:3000/events/click -u admin:wrongpass -H "Content-Type: application/json" -d "{\"correlation_id\":\"bad\"}"
Expected:
    { "error": "Unauthorized" }

Unauthorized (no credentials → rejected)
    curl -X POST http://localhost:3000/events/click -H "Content-Type: application/json" -d "{\"correlation_id\":\"bad\"}"
Expected:
    { "error": "Unauthorized" }

---

Invalid Payload (triggers **DLQ logging**)
    This one is missing required fields (only `correlation_id` given).
    It will be rejected **and written to `dlq/dlq.log`**.

    curl -X POST http://localhost:3000/events/click -u admin:secret -H "Content-Type: application/json" -d "{\"correlation_id\":\"dlq123\"}"
Expected:
    { "error": [ ...validation errors... ] }

Check your `dlq/dlq.log` file — it should contain the event with the missing field error.

---

Telemetry events
Authorized (valid payload)
    curl -X POST http://localhost:3000/telemetry -u admin:secret -H "Content-Type: application/json" -d "{\"telemetry\":\"someData\"}"
Expected:
    { "message": "Telemetry accepted" }

Unauthorized (no auth → rejected)
    curl -X POST http://localhost:3000/telemetry -H "Content-Type: application/json" -d "{\"telemetry\":\"someData\"}"
Expected:
    { "error": "Unauthorized" }
