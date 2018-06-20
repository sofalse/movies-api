import mongoose from 'mongoose'
import logger from './logger'

export enum DatabaseStatus {
    DBIDLE,
    DBCONNECTED,
    DBERROR,
}

class Database {
    private status: DatabaseStatus
    private uri: string

    constructor(uri: string = process.env.DB_URI || '') {
        this.status = DatabaseStatus.DBIDLE
        this.uri = uri
    }

    public connect() {
        mongoose.connect(this.uri).then(() => {
            logger.info('Connected to mongoDB.')
            return this.status = DatabaseStatus.DBCONNECTED
        }).catch(err => {
            logger.error('Error while connecting to mongoDB.')
            return this.status = DatabaseStatus.DBERROR
         })
    }

    public get getStatus(): DatabaseStatus {
        return this.status
    }

    public set setUri(uri: string) {
        if (this.status !== DatabaseStatus.DBCONNECTED) {
            this.uri = uri
        } else {
            logger.warning('Tried to set new database URI while it was connected.')
        }
    }
}

export default Database
