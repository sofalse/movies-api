import { model, Schema } from 'mongoose'

const Comment = new Schema({
    content: String,
    movieID: { type: Schema.Types.ObjectId, ref: 'Movie' },
}, { timestamps: true })

export default model('Comment', Comment)
