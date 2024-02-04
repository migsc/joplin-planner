#!/bin/bash

echo -n "Enter a version number: "
read version

cp -r ./* ~/joplin-planner/
cd ~/joplin-planner/
npm run dist
git status
git add .
git commit -m "v$version"
git tag v$version
git push --tags

npm publish