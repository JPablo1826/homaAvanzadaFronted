#!/bin/sh
set -e

: "${API_BASE_URL:=http://backend:8080}"

envsubst '$API_BASE_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec "$@"
