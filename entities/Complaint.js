export default {
  "name": "Complaint",
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "format": "date",
      "description": "Date of complaint"
    },
    "branch": {
      "type": "string",
      "description": "Branch name"
    },
    "complaint_type": {
      "type": "string",
      "enum": [
        "Service Quality",
        "Staff Behavior",
        "Equipment",
        "Schedule",
        "Safety",
        "Other"
      ],
      "description": "Type of complaint"
    },
    "description": {
      "type": "string",
      "description": "Detailed description"
    },
    "priority": {
      "type": "string",
      "enum": [
        "Low",
        "Medium",
        "High",
        "Critical"
      ],
      "default": "Medium",
      "description": "Priority level"
    },
    "status": {
      "type": "string",
      "enum": [
        "Open",
        "In Progress",
        "Resolved",
        "Closed"
      ],
      "default": "Open",
      "description": "Current status"
    }
  },
  "required": [
    "branch",
    "description"
  ]
};