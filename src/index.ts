import mysqlPromise from 'mysql2/promise'
import { Reshuffle, BaseConnector } from 'reshuffle-base-connector'

type Options = Record<string, any>
export type Query = (sql: string, params?: any[]) => Promise<any>
export type Sequence = (query: Query) => Promise<any>

export default class MySQLConnector extends BaseConnector {
  private client: typeof mysqlPromise
  private pool: mysqlPromise.Pool

  constructor(app: Reshuffle, options: Options = {}, id?: string) {
    super(app, options, id)

    this.client = mysqlPromise
    if (!options) {
      throw new Error('Empty connection config')
    }
    this.pool = this.client.createPool(this.configOptions)
  }

  // Your actions
  sdk(): typeof mysqlPromise {
    return this.client
  }

  public async close(): Promise<void> {
    await this.pool.end()
  }

  public async query(sql: string, params?: any[]): Promise<any> {
    try {
      const [rows, fields] = await this.pool.query(sql, params)
      return {
        fields: fields,
        rows: rows,
        rowCount: rows ? Object.keys(rows).length : 0,
      }
    } catch (error) {
      console.log(error)
    }
  }

  public async sequence(seq: Sequence): Promise<any> {
    const conn = await this.pool.getConnection()
    try {
      return await seq(conn.execute.bind(conn))
    } finally {
      conn.release()
    }
  }

  public async transaction(seq: Sequence): Promise<any> {
    const conn = await this.pool.getConnection()
    try {
      await conn.beginTransaction()
      const ret = await seq(conn.query.bind(conn))
      await conn.commit()
      return ret
    } catch (error) {
      console.log(error)
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }
  }
}

export { MySQLConnector }
