#!/bin/bash

if [ -z "$1" ]; then
    echo "need token"
    exit 1
fi

curl -s -H "Authorization: $1" "http://localhost:3000/protegido"
