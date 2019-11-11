#!/bin/bash

# Copied/modified from https://github.com/J535D165/recordlinkage/blob/master/deploy.sh

set -e
PACKAGE="asreview"

if ! git diff-index --quiet HEAD --; then

    echo "There are uncommited changes, do you want to continue (y/n)? "
    read cont
    if echo "$cont" | grep -iq "^n" ;then
        exit
    fi
fi

echo "The current versions are: "
git tag

echo ""
echo "Give a new version number (without v prefix)"
read version_tag

echo ""
git tag -a "v$version_tag" -m "Version $version_tag"

# Make the package installable. 
python setup.py sdist bdist_wheel

# wheel example: recordlinkage-0.6.0+0.g9c83c85.dirty-py2.py3-none-any.whl
# sdist example: recordlinkage-0.11.0+1.gf2bd314.dirty.tar.gz
base_path="dist/${PACKAGE}-"
whl_ext="-py3-none-any.whl"
sdist_ext=".tar.gz"
whl_full_path=$base_path$version_tag$whl_ext
sdist_full_path=$base_path$version_tag$sdist_ext

echo $whl_full_path
echo $sdist_full_path

if [ ! -f $sdist_full_path -o ! -f $whl_full_path ]; then
  echo "Error: failed to create wheel/sdist files $sdist_full_path $whl_full_path"
fi

echo ""
echo "Upload release to PiPy (y/n)? "
read upload_pip

if echo "$upload_pip" | grep -iq "^y" ; then

    twine upload $sdist_full_path $whl_full_path

fi

echo ""
echo "Push tag to GitHub (y/n)? "
read push_tag

if echo "$push_tag" | grep -iq "^y" ; then
  git push upstream "v$version_tag"
fi