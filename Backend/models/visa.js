import mongoose from "mongoose";

const VisaSchema = new mongoose.Schema(
	{
		category: {
			type: String,
			enum: ["with massar", "without massar"],
			required: true,
			trim: true,
		},
		passenger: {
			type: String,
			enum: ["infant", "adult"],
			required: true,
			trim: true,
		},
		agentName: {
			type: String,
			required: true,
			trim: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		companyCost: {
			type: Number,
			required: true,
			min: 0,
		},
		agentCost: {
			type: Number,
			required: true,
			min: 0,
		},
		// optional: reference to a user/agent who created the record
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		notes: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true }
);

const Visa = mongoose.model("Visa", VisaSchema);
export default Visa;
