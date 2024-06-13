#!/bin/bash

URL="http://localhost:3000/login"
HEADER="Content-Type: application/json"
DATA='{"username": "1234", "password": "1234"}'

echo "Enviando solicitação POST para $URL"
echo "Dados: $DATA"

RESPONSE=$(curl -X POST -s -H "$HEADER" -d "$DATA" "$URL")
echo "Resposta do servidor: $RESPONSE"

TOKEN=$(echo "$RESPONSE" | jq -r '.token')
echo "Token JWT obtido: $TOKEN"
