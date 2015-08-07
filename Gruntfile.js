var grunt = require('grunt');
grunt.loadNpmTasks('grunt-aws-lambda');

grunt.initConfig({
	lambda_invoke: {
		default: {
			options: {
				file_name: "DynamoDBBigQuery.js",
			}
		}
	},
	lambda_deploy: {
		default: {
			options: {
				region: 'us-east-1'
			},
			function: 'dynamodb-to-bigquery'
		}
	},
	lambda_package: {
		default: {
		}
	}
});

grunt.registerTask('deploy', ['lambda_package', 'lambda_deploy']);
