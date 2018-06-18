import { model, Schema } from 'mongoose'

const Comment = new Schema({
    content: String,
    movieID: String,
}, { timestamps: true })

export default model('Comment', Comment)
