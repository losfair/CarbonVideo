#!/bin/bash

echo $CV_CONFIG_GENERAL_JSON | base64 -i -d > /opt/CarbonVideo/config/general.json
echo $CV_CONFIG_ADMIN_USER_LIST_JSON | base64 -i -d > /opt/CarbonVideo/config/adminUserList.json
echo $CV_CONFIG_QINIU_JSON | base64 -i -d > /opt/CarbonVideo/config/qiniu.json
