#!/bin/sh
set -eu

if [ -n "${CONTEXT_SOURCE_READ_TOKEN:-}" ]; then
  cat > /tmp/git-askpass <<'EOF'
#!/bin/sh
case "$1" in
  *Username*) printf '%s\n' 'x-access-token' ;;
  *Password*) printf '%s\n' "$CONTEXT_SOURCE_READ_TOKEN" ;;
  *) exit 1 ;;
esac
EOF
  chmod 700 /tmp/git-askpass
  export GIT_ASKPASS=/tmp/git-askpass
  export GIT_TERMINAL_PROMPT=0
fi

exec node services/context-materializer/server.mjs
