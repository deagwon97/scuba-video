#!/bin/bash

apt-get update -y &&\
    apt-get upgrade -y &&\
    curl -sL https://deb.nodesource.com/setup_18.x | bash - &&\
    apt-get install nodejs -y &&\
    npm install -g yarn &&\
    yarn plugin import typescript &&\
    yarn dlx @yarnpkg/sdks vscode

yarn create react-app scuba --template typescript

cd scuba/

rm -rf node_modules
rm -rf yarn.lock
yarn set version berry