const mongoose = require("mongoose");
const { Schema } = mongoose;

const tripSchema = new Schema({
  title: {
    type: String,
    required: [true, "タイトルを入力してください"],
    maxLength: [20, "タイトルは20字以下で入力してください"]
  },
  prefecture: {
    type: Number,
    min: 0,
    max: 47
  },
  content: {
    type: String,
    required: [true, "内容を入力してください"],
    maxLength: [2000, "2000字以内で入力してください"]
  },
  // fishes: [{type:Schema.Types.ObjectId, ref: "Fish"}],
  // user: {type: Schema.Types.ObjectId, ref: "User", required: true},
  // comments: [{type: Schema.Types.ObjectId, ref: "Comment"}],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Reverse populate with virtuals
tripSchema.virtual("fishes", {
  ref: "Fish",
  localField: "_id",
  foreignField: "trip",
  justOne: false
});

// Cascade delete fishes when a trip is deleted
tripSchema.pre("remove", async function (next) {
  await this.model("Fish").deleteMany({ trip: this._id });
  next();
});

module.exports = mongoose.model("Trip", tripSchema);