var config = require('./gcpconfig');
var gcloud = require('gcloud');
var unmarshalItem = require('dynamodb-marshaler').unmarshalItem;
var _ = require('lodash');

exports.handler = function(event, context) {

  var rows = _.chain(event.Records)
  .filter(function(obj) {
    return obj.eventName == 'INSERT' || obj.eventName == 'MODIFY';
  })
  .pluck('dynamodb.NewImage')
  .map(function(element) {
    return unmarshalItem(element);
  }).value();

  var tableName;
  if (_.has(config, 'table') && config.table) {
    tableName = config.table
  } else {
    var arn =  _.chain(event.Records).first().get('eventSourceARN').toString();
    var resource = arn.split(':')[5];
    tableName = resource.split('/')[1];
  }
  console.log('tableName:', tableName);

  var bigquery = gcloud.bigquery({
    projectId: config.project,
    keyFilename: 'gcpkey.json',
  });
  var table = bigquery.dataset(config.dataset).table(tableName);

  var options = {};
  if (config.tablePartitionPeriod == "monthly") {
    var date = new Date();
    date.setDate(1);
    options.templateSuffix = getTemplateSuffix(date);
  } else if (config.tablePartitionPeriod == "daily") {
    var date = new Date();
    options.templateSuffix = getTemplateSuffix(date);
  }

  table.insert(rows, options, function(err, insertErrors, apiResponse) {
    if (err) return context.done(err);
    if (insertErrors && insertErrors.length > 0) {
      _.forEach(insertErrors, function (insertError){
        console.log(insertError.row);
        _.forEach(insertError.error, function(e) {
          console.log("%s: %s", e.reason, e.message);
        });
      });
      return context.done("error");
    }
    console.log(apiResponse);
    context.done(null, "success");
  });
};

function getTemplateSuffix(d) {
  return d.getFullYear() + padZero(d.getMonth() + 1) + padZero(d.getDate());
}

function padZero(n) {
  if (n > 9) {
    return n.toString(10);
  }
  return '0' + n.toString(10);
}
