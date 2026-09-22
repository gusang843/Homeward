import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompany extends Document {
  userId: string;
  name: string;
  jobPostUrl?: string;
  status: string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    jobPostUrl: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      default: "지원 전",
      enum: [
        "지원 전",
        "서류 제출",
        "서류 합격",
        "면접",
        "최종 합격",
        "불합격",
      ],
    },

    deadline: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Company: Model<ICompany> =
  mongoose.models.CompanyV2 ||
  mongoose.model<ICompany>(
    "CompanyV2",
    CompanySchema,
    "companies"
  );

export default Company;