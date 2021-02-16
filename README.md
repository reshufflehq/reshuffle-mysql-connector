# reshuffle-mysql-connector

[Code](https://github.com/reshufflehq/reshuffle-mysql-connector) |
[npm](https://www.npmjs.com/package/reshuffle-mysql-connector) |
[Code sample](https://github.com/reshufflehq/reshuffle-mysql-connector/tree/master/examples)

`npm install reshuffle-mysql-connector`

### Reshuffle MySQL Connector

This package contains a [Reshuffle](https://github.com/reshufflehq/reshuffle)
connector to MySQL databases.

The connector uses [Node MySQL 2 Client](https://www.npmjs.com/package/mysql2) package.

The following example lists all information from the "users" table:

```js
const { Reshuffle } = require('reshuffle')
const { MySQLConnector } = require('reshuffle-mysql-connector')

  const app = new Reshuffle()
  const mysql = new MySQLConnector(app)
  const connection = mysql.sdk().createConnection({
    host: 'DB_HOST',
    user: 'DB_USERNAME',
    password: 'DB_PASSWORD',
    database: 'DB_NAME'
  })
  connection.execute(
    'SELECT * FROM `Users` WHERE `name` = ? AND `age` > ?', ['Rick', 25],
    function(err, results, fields) {
      console.log('a: ',results); // results contains rows returned by server
      console.log('b: ',fields); // fields contains extra meta data about results, if available   
    }
  )

```

#### Table of Contents

_Connector actions_:

[sdk](#sdk) Retrieve the client sdk object

[sdkPromise](#sdkPromise) Retrieve the client sdk object with support of Promise API

#### Connector actions

##### <a name="sdk"></a>Full access to the MySQL Client SDK


```js
const sdk = mysql.sdk()
```

More details and code samples about Node MySQL 2 Client can be found [here](https://www.npmjs.com/package/mysql2)


##### <a name="sdkPromise"></a>Full access to the MySQL Client SDK with support of Promise API


```js
const sdkPromise = mysql.sdkPromise()
```

More details and code samples about Node MySQL 2 Promise API can be found [here](https://www.npmjs.com/package/mysql2#using-promise-wrapper)