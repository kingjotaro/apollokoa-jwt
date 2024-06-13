#!/bin/bash

if [ $# -eq 0 ]; then
    echo "need token"
    exit 1
fi

URL="http://localhost:3000/protegido"
TOKEN="$1"

curl -X GET -s -H "Authorization: Bearer $TOKEN" "$URL"
