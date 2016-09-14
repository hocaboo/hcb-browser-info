#!/usr/bin/env bash

uglifyjs browser_info.js -c "evaluate=false" -m --source-map browser_info.min.map -o browser_info.min.js
