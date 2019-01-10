#!/bin/bash
set -e # Exit immediately if something throws an error

echo `ruby -v`

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD) 
CURRENT_COMMIT=$(git log '--format=format:%H' -1)

rm -rf _site
git worktree add -f _site gh-pages

bundle install
bundle exec jekyll build

cd _site
git add --all
git commit -m "Docs build from $CURRENT_BRANCH $CURRENT_COMMIT"
git push origin gh-pages

echo "Completed"
