import mongoose from 'mongoose';

const { Schema } = mongoose;

const UploadReceiptSchema = new Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  filename: String,
});

export const UploadReceipt = mongoose.model('UploadReceipt', UploadReceiptSchema);
