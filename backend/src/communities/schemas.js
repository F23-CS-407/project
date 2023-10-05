import mongoose from 'mongoose';
const { Schema } = mongoose;

const communitySchema = new Schema({
  name: String,
  description: String,
  mods: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
  ],

  /*To add rest later, particularly posts this sprint*/
});

export const Community = mongoose.model('Community', communitySchema);