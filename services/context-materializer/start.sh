#!/bin/sh
set -eu

if [ -n "${CONTEXT_SOURCE_READ_TOKEN:-}" ]; then
  export GIT_CONFIG_COUNT=1
  export GIT_CONFIG_KEY_0='url.https://x-access-token:'"${CONTEXT_SOURCE_READ_TOKEN}"'@github.com/.insteadOf'
  export GIT_CONFIG_VALUE_0='https://github.com/'
fi

exec node services/context-materializer/server.mjs
