#!/bin/bash
docker run -e CV_CONFIG_GENERAL_JSON="$(base64 -w 0 < config/general.json)" -e CV_CONFIG_ADMIN_USER_LIST_JSON="$(base64 -w 0 < config/adminUserList.json)" -e CV_CONFIG_QINIU_JSON="$(base64 -w 0 < config/qiniu.json)" -d losfair/carbonvideo
