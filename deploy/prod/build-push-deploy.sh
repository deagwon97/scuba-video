#!/bin/bash

cd ../../

docker build -t harbor.deagwon.com/scuba-video/scuba-video:latest .

docker push harbor.deagwon.com/scuba-video/scuba-video:latest

cd ./deploy/prod

kubectl apply -k .

kubectl rollout restart deployment scuba-video -n scuba-video