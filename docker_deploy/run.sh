#!/bin/bash

cd /opt/CarbonVideo
./cfg_loader.sh
runuser -u mongodb -- /opt/mongodb/bin/mongod --bind_ip 127.0.0.1 &
sleep 3
runuser -u carbonvideo -- node --harmony backend/main.js
