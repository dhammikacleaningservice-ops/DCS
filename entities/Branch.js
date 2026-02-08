export default {
  "name": "Branch",
  "type": "object",
  "properties": {
    "branch_name": {
      "type": "string",
      "description": "Name of the branch"
    },
    "manager": {
      "type": "string",
      "description": "Branch manager name"
    },
    "manager_phone": {
      "type": "string",
      "description": "Manager phone number"
    },
    "branch_contact": {
      "type": "string",
      "description": "Branch contact number"
    },
    "backup_contact": {
      "type": "string",
      "description": "Backup contact number"
    },
    "status": {
      "type": "string",
      "enum": [
        "Active",
        "Minor Issue",
        "Critical",
        "Renovation"
      ],
      "default": "Active",
      "description": "Current branch status"
    },
    "map_link": {
      "type": "string",
      "description": "Google Maps link"
    }
  },
  "required": [
    "branch_name"
  ]
};