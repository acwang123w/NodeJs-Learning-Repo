const request = require("supertest");
const app = require("../server");

const auth = {
  user: "admin",
  pass: "secret"
};

// Retry helper
async function retryRequest(requestFn, retries = 3, delay = 100) {
  for (let i = 0; i < retries; i++) {
    const res = await requestFn();
    if (res.status === 200) return res;
    await new Promise((r) => setTimeout(r, delay));
    delay *= 2; // exponential backoff
  }
  return requestFn(); // final attempt
}

describe("API tests", () => {
  // Health endpoint
  it("should return health status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  // Auth checks
  it("should reject unauthorized event", async () => {
    const res = await request(app).post("/events/click").send({});
    expect(res.status).toBe(401);
  });

  it("should reject telemetry without auth", async () => {
    const res = await request(app)
      .post("/telemetry")
      .send({ telemetry: "data" });
    expect(res.status).toBe(401);
  });

  // Click events
  it("should accept a valid click event", async () => {
    const event = {
      correlation_id: "abc123",
      sku_id: "SKU1",
      track_id: "TRACK1",
      device_id: "DEVICE1",
      ts: new Date().toISOString()
    };

    const res = await request(app)
      .post("/events/click")
      .auth(auth.user, auth.pass)
      .send(event);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Event accepted");
  });

  it("should ignore duplicate events", async () => {
    const event = {
      correlation_id: "dup123",
      sku_id: "SKU1",
      track_id: "TRACK1",
      device_id: "DEVICE1",
      ts: new Date().toISOString()
    };

    await request(app)
      .post("/events/click")
      .auth(auth.user, auth.pass)
      .send(event);

    const res2 = await request(app)
      .post("/events/click")
      .auth(auth.user, auth.pass)
      .send(event);

    expect(res2.body.message).toBe("Duplicate ignored");
  });

  it("should reject invalid click events", async () => {
    const res = await request(app)
      .post("/events/click")
      .auth(auth.user, auth.pass)
      .send({ correlation_id: "bad" }); // missing required fields

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  // Telemetry events
  it("should accept telemetry events", async () => {
    const res = await request(app)
      .post("/telemetry")
      .auth(auth.user, auth.pass)
      .send({ telemetry: "data" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Telemetry accepted");
  });

  // Retry/backoff test
  it("should retry failed requests with backoff", async () => {
    const event = {
      correlation_id: "retry123",
      sku_id: "SKU1",
      track_id: "TRACK1",
      device_id: "DEVICE1",
      ts: new Date().toISOString()
    };

    const res = await retryRequest(() =>
      request(app)
        .post("/events/click")
        .auth(auth.user, auth.pass)
        .send(event)
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Event accepted");
  });
});
