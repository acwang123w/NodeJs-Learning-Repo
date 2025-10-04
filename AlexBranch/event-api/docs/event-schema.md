# Event Schema Documentation

This document defines the structure and validation rules for click events ingested by the API.

---

## Event Fields

| Field          | Type      | Description                       |
|----------------|-----------|-----------------------------------|
| correlation_id | string    | Unique ID for event deduplication |
| sku_id         | string    | SKU identifier                    |
| track_id       | string    | Tracking ID                       |
| device_id      | string    | Device identifier                 |
| ts             | date-time | ISO 8601 UTC timestamp            |

---

## Example Click Event (valid payload)

```json
{
  "correlation_id": "abc123",
  "sku_id": "SKU1",
  "track_id": "TRACK1",
  "device_id": "DEVICE1",
  "ts": "2025-10-01T17:30:00.000Z"
}
```

---

## JSON Schema (Validation Rules)

```json
{
  "type": "object",
  "properties": {
    "correlation_id": { "type": "string" },
    "sku_id": { "type": "string" },
    "track_id": { "type": "string" },
    "device_id": { "type": "string" },
    "ts": { "type": "string", "format": "date-time" }
  },
  "required": ["correlation_id", "sku_id", "track_id", "device_id", "ts"],
  "additionalProperties": false
}
```
