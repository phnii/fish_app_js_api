const mongoose = require("mongoose");
const { Schema } = mongoose;

const fishSchema = new Schema({
  name: {
    type: String,
    required: [true, "魚名を入力してください"],
    match: [/^[ァ-ヶー　]*$/, "魚名は全角カタカナで入力してください"]
  },
  image: {
    type: String,
  },
  trip: {type: Schema.Types.ObjectId, ref: "Trip", required: true}
});

module.exports = mongoose.model("Fish", fishSchema);