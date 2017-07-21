#!/usr/bin/env bash
METEOR_PACKAGE_DIRS=../ meteor test-packages TEST_BROWSER_DRIVER=phantomjs ./ --once --driver-package dispatch:mocha