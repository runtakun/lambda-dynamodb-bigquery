var _ = require('lodash');

exports.handler = function(event, contenxt) {

  var rows = _.chain(event.Records)
  .filter(function(obj) {
    return obj.eventName == 'INSERT' || obj.eventName == 'MODIFY';
  })
  .pluck('dynamodb.NewImage')
  .map(function(el) {
    var item = _.mapValues(el, function(obj) {
      var val;
      if (_.has(obj, 'S')) {
        val = obj.S;
      } else if (_.has(obj, 'N')) {
        val = _.parseInt(obj.N, 10);
      }
      return val;
    });
    return item;
  });
  console.log('rows:', JSON.stringify(rows, null, 2));
};
