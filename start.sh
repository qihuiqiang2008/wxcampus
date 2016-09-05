#!/bin/bash
export PATH=$PATH:/root/software/node-v0.10.32-linux-x64/bin
/root/app/wxcampus001/wxcampus/node_modules/forever/bin/forever start /root/app/wxcampus001/wxcampus/app.js
