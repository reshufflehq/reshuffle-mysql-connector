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
  const mysql = new MySQLConnector(app, {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  })

  const result = await mysql.query("SELECT * FROM Users where firstName = 'John'")
  console.log('rows: ',result.rows)
  console.log('fields: ',result.fields)

```

#### Table of Contents

[Configuration](#configuration) Configuration options

_Connector actions_:

[close](#close) Close all active connections

[query](#query) Run a single query on the database

[sequence](#sequence) Run a series of queries on the databse

[transaction](#transaction) Run a transaction on the databae

[sdk](#sdk) Retrieve the client sdk object with support of Promise API

##### <a name="configuration"></a>Configuration options

```js

const app = new Reshuffle();
const mysql = new MySQLConnector(app, {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME 
})
```

For more information about connection attributes check the [mysql2](https://www.npmjs.com/package/mysql2) and [Node.js mysql Connection Options](https://github.com/mysqljs/mysql#connection-options) documentation.


#### Connector actions

##### <a name="close"></a>Close action

```js
await mysql.close()
```

Close all connections to the database. If an application terminates without
calling close, it might hang for a few seconds until active connections
time out.

##### <a name="query"></a>Query action


```js
await mysql.query("INSERT INTO users VALUES ('John', 'Coltrane', 42)")

const family = await mysql.query(
  "SELECT firstName, lastName, age FROM users WHERE lastName='Coltrane'"
)

const avgResponse = await mysql.query(
  "SELECT average(age) AS avg FROM users WHERE lastName='Coltrane'"
)
const averageAge = avgResponse.rows[0].avg

```

The `query` action can be used to run _any_ SQL command on the connected
database (not just `SELECT`). The query is defined in the `sql` string. The
optional `params` can be used to generate parameterized queries, as shown in
the following example:

```js
const age = await mysql.query(
  "SELECT age FROM users WHERE firstName = ? and lastName = ?",
  ['John', 'Smith']
)
```

This action returns an object with the results of the query, where
`fields` is an array of all field names, as returned by the query.
Field names in a `SELECT` query are column names, or are specified
with an `AS` clause. Every element of `rows` is uses the names in
`fields` as its object keys.

Note that every call to `query` may use a different database connection.
You can use the [sequence](#sequence) or [transaction](#transaction) actions
if such a guarantee is required.

##### <a name="sequence"></a>Sequence action


```js
const res = await mysql.sequence(async (query) => {
  await query("INSERT INTO users VALUES ('Miles', 'Davis', 43)")
  return query("SELECT COUNT(*) FROM users where 1")
})
const userCount = res.rows[0].count

```

Use `sequence` to perform multiple queries on the same database connection.
This action receives a `seq` function that may issue queries to the database,
all of which are guaranteed to run through the same connection. `seq` gets
one argument, which is a `query` function that can be used the same way as
the [query](#query) action. `seq` may, of course, use any JavaScript code to
implement its logic, log to the console etc.

Note that while `sequence` uses the same connection to run all queries, it
does not offer the transactional guarantees offered by
[transaction](#transaction). You can use it for weak isolation models, or
construct transactions directly without using `transaction`.

##### <a name="transaction"></a>Transaction action


```js
await mysql.transaction(async (query) => {
  const res = await query("SELECT COUNT(*) FROM users")
  const userCount = res.rows[0].count
  if (100 <= userCount) {
    throw new Error('Too many users:', userCount)
  }
  return query("INSERT INTO users VALUES ('Charlie', 'Parker', 49)")
})
```

Use `transaction` to run multiple queries as an atomic SQL transaction.
The interface is identical to the [sequence action](#sequence), but all
the queries issued `seq` either success or fail together. If any of the
queries fail, all queries are rolled back and an error is thrown.

Consider, for example, the following code for updating a bank account
balance:

```js
  const accountId = 289
  const change = +1000
  mysql.transaction(async (query) => {
    await query(`
      UPDATE accounts
        SET balance = balance + ?
        WHERE account_id = ?
      `,
      [change, accountId],
    )
    await query(`
      INSERT INTO accounts_log(account_id, change, time)
        VALUES (?, ?, current_timestamp)
      `,
      [change, accountId],
    )
  })
```

##### <a name="sdk"></a>Full access to the MySQL Client SDK with support of Promise API


```js
const sdk = mysql.sdk()

const connection = await mysql.sdk().createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME 
})

const [rows, fields] = await connection.execute('SELECT * FROM `Users` where 1')
console.log('rows: ',rows)
console.log('fields: ',fields)


```


More details and code samples about Node MySQL 2 Promise API can be found [here](https://www.npmjs.com/package/mysql2#using-promise-wrapper)