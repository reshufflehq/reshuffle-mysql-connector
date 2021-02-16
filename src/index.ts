import mysql2 from 'mysql2'
import mysqlPromise from 'mysql2/promise'
import { Reshuffle, BaseConnector } from 'reshuffle-base-connector'

export default class MySQLConnector extends BaseConnector<null, null> {
  private client?: any
  private clientPromise?: any

  constructor(app: Reshuffle, id?: string) {
    super(app, null, id)
    this.client = mysql2
    this.clientPromise = mysqlPromise
  }

  // Your actions
  sdk() {
    return this.client
  }

  sdkPromise() {
    return this.clientPromise
  }
}

export { MySQLConnector }
