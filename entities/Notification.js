export default {
  "name": "Notification",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Notification title"
    },
    "message": {
      "type": "string",
      "description": "Notification message"
    },
    "type": {
      "type": "string",
      "enum": [
        "complaint",
        "branch_status",
        "payment",
        "staff",
        "system"
      ],
      "description": "Type of notification"
    },
    "priority": {
      "type": "string",
      "enum": [
        "high",
        "critical",
        "medium",
        "low"
      ],
      "default": "medium",
      "description": "Notification priority"
    },
    "related_id": {
      "type": "string",
      "description": "ID of related entity"
    },
    "related_entity": {
      "type": "string",
      "description": "Type of related entity (branch, complaint, etc)"
    },
    "is_read": {
      "type": "boolean",
      "default": false,
      "description": "Whether notification has been read"
    }
  },
  "required": [
    "title",
    "message",
    "type"
  ]
};