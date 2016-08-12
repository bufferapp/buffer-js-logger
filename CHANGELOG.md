# Changelog

## 0.2.1

* Use `timestamp` instead of `time` due to issues with Fluentd plugins

## 0.2

* Use default Bunyan `time` field for all time based aggregation, dropping the logstash style
`@timestmap`.

## 0.1

* Initial release
* Middleware logger for Express/Connect applications
