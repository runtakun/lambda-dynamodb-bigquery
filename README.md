# lambda-dynamodb-bigquery

AWS Lambda function for insert DynamoDB records to Google BigQuery

## How to build

This package depends on `gcloud` and it uses native code. So you have to build on Amazon Linux to execute AWS Lambda.

- Launch new Amazon Linux instance

- Install required packages to the instance

```shell
sudo yum update
sudo yum install git-core
sudo yum groupinstall "Development Tools"
```

- Install nvm

```shell
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
```

- Install Node.js

```shell
nvm install v0.10.44
```

- Clone repository

```shell
git clone https://github.com/runtakun/lambda-dynamodb-bigquery.git
```

- change directory and install npm packages

```shell
cd lambda-dynamodb-bigquery
npm install
```

- add configuration file and account key file

- install grunt and build package

```shell
npm install -g grunt-cli
grunt lambda_package
```

- create AWS Lambda function and upload package

Create Lambda function in AWS console and speficy `Node.js 0.10` in Runtime section.

## Account key

Create service account at developer console (below link) and download key file.

https://console.cloud.google.com/permissions/serviceaccounts

## Configuration

You should specify project name and dataset id by JSON file named `gcpconfig.json`.

Exmaple:

```json
{"project": "lambda-bigquery-sample", "dataset": "sample"}
```

## Table name

By default, BigQuery table will be named with the same as DynamoDB's one. But you can specify specific name by configuration.


Exmaple:

```json
{"project": "lambda-bigquery-sample", "dataset": "sample", "table": "Sample"}
```


### Table partitioning

You can use table partitioning by configuration field `tablePartitionPeriod` and specifing `daily` or `monthly`. You should create normal table before data is inserted. For example, if you creates table named `Sample` on BigQuery, BigQuery creates `Sample20160401` table.

Exmaple:

```json
{"project": "lambda-bigquery-sample", "dataset": "sample", "tablePartitionPeriod": "monthly"}
```
