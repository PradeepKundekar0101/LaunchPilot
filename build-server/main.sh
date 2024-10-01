#!/bin/bash
export GIT_REPO_URL="$GIT_REPO_URL"
git clone "$GIT_REPO_URL" /home/app/output
if [ $? -eq 0 ]; then
    exec node script.js
else
    echo "Failed to clone the Git repository"
    exit 1
fi
