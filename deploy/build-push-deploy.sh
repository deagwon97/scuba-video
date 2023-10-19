#!/bin/bash

cd ..

docker build -t harbor.deagwon.com/scuba-video/scuba-video:latest --no-cache .

docker push harbor.deagwon.com/scuba-video/scuba-video:latest

cd ./deploy

kubectl apply -k .

kubectl rollout restart deployment scuba-video -n scuba-video