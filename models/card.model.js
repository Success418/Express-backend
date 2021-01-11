const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Types = Schema.Types;

const CardSchema = new Schema({
    title: Types.String,
    body: Types.String,
})

module.exports = mongoose.model("Card", CardSchema, "cards")