#!/bin/bash
# sync_repos.sh
# Script to sync changes from organization repo to personal fork for Vercel deployment
# Author: iNezerr

echo "🔄 Starting synchronization between Hues-Apply/HA_frontendV1 and iNezerr/HA_frontendV1..."

# Store the current directory
CURRENT_DIR=$(pwd)

# Check if the local repo exists
if [ -d "c:/src/HuesApply/HA_frontendV1" ]; then
  cd "c:/src/HuesApply/HA_frontendV1"

  echo "📋 Checking for uncommitted changes in Hues-Apply repo..."
  if [[ $(git status --porcelain) ]]; then
    echo "⚠️ Uncommitted changes detected. Committing them first..."
    git add .
    git commit -m "Auto-commit before sync: $(date)"
    git push
    echo "✅ Changes committed and pushed to Hues-Apply repo."
  else
    echo "✅ No uncommitted changes in Hues-Apply repo."
  fi
  
  # Get the current branch name
  CURRENT_BRANCH=$(git branch --show-current)
  echo "🌿 Current branch: $CURRENT_BRANCH"
  
  # Make sure we have the latest changes for current branch
  echo "⬇️ Pulling latest changes from Hues-Apply repo for branch: $CURRENT_BRANCH..."
  git pull origin $CURRENT_BRANCH
  
  # Now let's handle the personal fork
  echo "🔍 Checking if iNezerr fork is configured as a remote..."
  if ! git remote | grep -q "personal"; then
    echo "➕ Adding iNezerr fork as 'personal' remote..."
    git remote add personal https://github.com/iNezerr/HA_frontendV1.git
  else
    echo "✅ Remote 'personal' already configured."
  fi
  
  # Fetch from personal fork to make sure we're up to date
  echo "⬇️ Fetching from iNezerr fork..."
  git fetch personal
  
  # Check if branch exists on personal fork, if not create it
  echo "🔍 Checking if branch '$CURRENT_BRANCH' exists on personal fork..."
  if git ls-remote --heads personal $CURRENT_BRANCH | grep -q $CURRENT_BRANCH; then
    echo "✅ Branch '$CURRENT_BRANCH' exists on personal fork."
  else
    echo "🆕 Branch '$CURRENT_BRANCH' doesn't exist on personal fork. Will create it."
  fi
  
  # Push changes to personal fork (will create branch if it doesn't exist)
  echo "⬆️ Pushing changes to iNezerr fork on branch: $CURRENT_BRANCH..."
  git push personal $CURRENT_BRANCH
  
  echo "🎉 Synchronization complete! Vercel should now start deploying automatically."
  echo "📊 Check deployment status at: https://vercel.com/inezerr/ha-frontend"

  # Return to original directory
  cd "$CURRENT_DIR"
else
  echo "❌ Error: Repository directory not found at c:/src/HuesApply/HA_frontendV1"
  exit 1
fi
