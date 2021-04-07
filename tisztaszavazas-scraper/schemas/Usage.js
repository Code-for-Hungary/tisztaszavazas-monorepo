import mongoose from 'mongoose';

const UsageSchema = mongoose.Schema({
	name: String,
  ip: String
},
{
  timestamps: true,
})

export default mongoose.model('Usage', UsageSchema);