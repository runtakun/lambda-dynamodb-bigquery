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
  });
  console.log('rows:', JSON.stringify(rows, null, 2));

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

  table.insert(rows, function(err, insertErrors) {
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

    context.done(null, "success");
  });
};
