#!/bin/bash

LOGIN=$(curl -s -X POST https://business-app-staging.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@monentreprise.com","password":"motdepasse123"}')

TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token: $TOKEN"

curl -X POST https://business-app-staging.onrender.com/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"company_id":"b8f05d08-2d1d-45a6-a2e1-df90041fdeaa","first_name":"Jean","last_name":"Dupont","role":"Directeur Achats","email":"jean@test.com","phone":"+33612345678"}'