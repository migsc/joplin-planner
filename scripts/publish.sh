#!/bin/bash

echo -n "Enter a version number: "
read version

jq --arg version "$new_version" '.version = $version' package.json > temp.json && mv temp.json package.json
rm temp.json

npm run dist

cp -r ./* ~/joplin-planner/
cd ~/joplin-planner/
git status
git add .
git commit -m "v$version"
git tag v$version
git push --tags

npm publish