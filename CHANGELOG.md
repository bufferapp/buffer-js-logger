# Changelog

## 0.6

* Add Fluentd forward over tcp functionality

## 0.5

* Always log to `stdout`. Removed logging from disk

## 0.4

* Add new basic logger `logger.js`
* Always log `timestamp` field

*0.3.0 Skipped*

## 0.2.1

* Use `timestamp` instead of `time` due to issues with Fluentd plugins

## 0.2

* Use default Bunyan `time` field for all time based aggregation, dropping the logstash style
`@timestmap`.

## 0.1

* Initial release
* Middleware logger for Express/Connect applications
