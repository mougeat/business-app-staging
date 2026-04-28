#!/bin/bash

LOGIN=$(curl -s -X POST https://business-app-staging.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@monentreprise.com","password":"motdepasse123"}')

TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "=== Token OK ==="

# Test créer une communication
curl -X POST https://business-app-staging.onrender.com/api/communications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"phone_call","subject":"Premier contact","body":"Appel de présentation, client intéressé","company_id":"b8f05d08-2d1d-45a6-a2e1-df90041fdeaa","contact_id":"36ac9aab-4175-4557-a615-7b275bb9d123"}'

echo ""
echo "=== Liste communications ==="

# Test liste communications
curl https://business-app-staging.onrender.com/api/communications?company_id=b8f05d08-2d1d-45a6-a2e1-df90041fdeaa \
  -H "Authorization: Bearer $TOKEN"