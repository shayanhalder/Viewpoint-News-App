#!/bin/bash
export PATH="/root/.nvm/versions/node/v21.7.3/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"
date=$(date +%m-%d-%Y)
time=$(date +%H-%M-%S)
logName="$time"
cd /root/Viewpoint-News-App/backend
mkdir -p "jobs/logs/$date"
npx ts-node "./jobs/newsUpdater.ts" &> "./jobs/logs/$date/$logName"
exit_status=$?
if [ $exit_status -ne 0 ]; then
    mv "./jobs/logs/$date/$logName" "./jobs/logs/$date/$logName-error.log"
else
    mv "./jobs/logs/$date/$logName" "./jobs/logs/$date/$logName-success.log"
fi
