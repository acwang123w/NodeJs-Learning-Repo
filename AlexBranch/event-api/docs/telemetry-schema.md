# Telemetry Schema Documentation

## Telemetry Fields

| Field     | Type   | Description                       |
|-----------|--------|-----------------------------------|
| telemetry | string | Arbitrary telemetry data payload. |

---

## Example Telemetry Event

```json
{
  "telemetry": "someData"
}
```

---

## JSON Schema (Validation Rules)

```json
{
  "type": "object",
  "properties": {
    "telemetry": { "type": "string" }
  },
  "required": ["telemetry"],
  "additionalProperties": true
}
```
