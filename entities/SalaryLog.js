export default {
  "name": "SalaryLog",
  "type": "object",
  "properties": {
    "payment_id": {
      "type": "string",
      "description": "Unique payment identifier"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Payment date"
    },
    "month": {
      "type": "string",
      "enum": [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ],
      "description": "Payment month"
    },
    "staff_name": {
      "type": "string",
      "description": "Staff member name"
    },
    "role": {
      "type": "string",
      "description": "Staff role"
    },
    "gross_total": {
      "type": "number",
      "description": "Gross total amount"
    },
    "deductions": {
      "type": "number",
      "description": "Total deductions"
    },
    "net_pay": {
      "type": "number",
      "description": "Net pay amount"
    },
    "work_log": {
      "type": "array",
      "description": "Work log entries",
      "items": {
        "type": "object",
        "properties": {
          "branch": {
            "type": "string"
          },
          "days": {
            "type": "number"
          },
          "rate": {
            "type": "number"
          },
          "total": {
            "type": "number"
          }
        }
      }
    }
  },
  "required": [
    "staff_name",
    "gross_total",
    "net_pay"
  ]
};