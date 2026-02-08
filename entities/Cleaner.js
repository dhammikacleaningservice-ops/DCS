export default {
  "name": "Cleaner",
  "type": "object",
  "properties": {
    "photo_url": {
      "type": "string",
      "description": "Profile photo URL"
    },
    "name": {
      "type": "string",
      "description": "Full name"
    },
    "role": {
      "type": "string",
      "enum": [
        "Cleaner",
        "Assistant",
        "Supervisor",
        "Manager"
      ],
      "default": "Cleaner",
      "description": "Job role"
    },
    "phone": {
      "type": "string",
      "description": "Phone number"
    },
    "assigned_branch": {
      "type": "string",
      "description": "Branch assigned to"
    },
    "status": {
      "type": "string",
      "enum": [
        "Active",
        "On Leave",
        "Resigned"
      ],
      "default": "Active",
      "description": "Employment status"
    }
  },
  "required": [
    "name"
  ]
};