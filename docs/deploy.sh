#!/bin/bash
set -x # Exit immediately if something throws an error

$CURRENT_BRANCH = $(git rev-parse --abbrev-ref HEAD) 
$CURRENT_COMMIT = $(git log '--format=format:%H' -1)

git worktree add -f -b gh-pages _site gh-pages

rm -rf _site/*
bundle install
bundle exec jekyll build

cd _site
git add --all
git commit -m "Docs build from $CURRENT_BRANCH $CURRENT_COMMIT"
git push origin gh-pages

echo "Completed"
