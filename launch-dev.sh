#!/usr/bin/env bash

EXT_PATH="/home/rajeev/work/personal/vs-code-theme/theme-creator/theme-your-code"

# Start tsc in watch mode
tsc --watch &
TSC_PID=$!

# Launch extension host
code --extensionDevelopmentPath="$EXT_PATH"

# Watch for rebuilds and reload VS Code window
chokidar "$EXT_PATH/dist/**/*.js" -c "code --reuse-window --command workbench.action.reloadWindow" &
WATCH_PID=$!

trap "kill $TSC_PID $WATCH_PID" EXIT
wait
