import mongoose from 'mongoose';
const { Schema } = mongoose;

/*There's a more elegant way to do this with inheritence. Technically,
maps are a 1-1 relationship with boards. So we can likely do this in a better
way */
const MapSchema = new Schema({
  posts: [
    {
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
      location: [Number, Number], //array with x and y.
    },
  ],
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UploadReceipt',
  },
});

export const Map = mongoose.model('Map', MapSchema);
