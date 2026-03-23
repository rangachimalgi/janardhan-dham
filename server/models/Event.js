import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  hall: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    subname: { type: String },
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  purohitName: { type: String, default: '' },
  purohitPhone: { type: String, default: '' },
  catererName: { type: String, default: '' },
  catererPhone: { type: String, default: '' },
  advance: { type: String, default: '' },
  balance: { type: String, default: '' },
  notes: { type: String, default: '' },
  date: { type: Date, required: true },
}, {
  timestamps: true,
});

export default mongoose.model('Event', eventSchema);
