const mongoose = require("mongoose");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");

// user schema
const userSchema = new mongoose.Schema(
  {
    surName: {
      type: String,
      trim: true,
      required: true,
      max: 50,
    },
    firstName: {
      type: String,
      trim: true,
      required: true,
      max: 50,
    },
    roles: {
      User: {
        type: Number,
        default: 5150, //TODO: change default role back to admin 2001
      },
      Editor: Number,
      Admin: Number,
    },
    date: {
      type: Date,
      default: Date.now,
      trim: true,
      required: false,
    },
    gender: {
      type: String,
      trim: true,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    consent: {
      type: Boolean,
      // required: false,
    },
    birthDay: {
      type: String,
      trim: true,
      required: true,
      max: 11,
    },
    ageGroup: {
      type: String,
      enum: ["18 - 25", "26 - 35", "36 - 45", "46 - 55", "56 and above"],
      trim: true,
      required: true,
      max: 15,
    },
    residentialArea: {
      type: String,
      trim: true,
      required: false,
      max: 100,
    },
    phoneNumber: {
      type: String,
      trim: true,
      required: true,
      max: 11,
    },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed", "Other"],
      trim: true,
      required: true,
      max: 9,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    industry: {
      type: String,
      enum: [
        "Finance and Investment",
        "Agriculture",
        "Education and Training",
        "Consulting",
        "Medical",
        "Trade and Commerce",
        "Power and Energy",
        "Technology",
        "Arts and Entertainment",
        "Legal",
        "Public Sector",
        "Telecoms",
        "Manufacturing",
        "Media and Advertising",
        "Small Business",
        "Logistics",
        "Mining",
        "Hospitality",
        "Others",
      ],
      trim: true,
      required: false,
      max: 32,
    },
    department: {
      name: String,
      id: ObjectId,
    },
    howDidYouHearAboutUs: {
      type: String,
      enum: [
        "Billboards",
        "Social media",
        "Friends and family",
        "TV-Radio-Print Media",
        "TCN Event",
        "Spirit Led",
        "Others",
      ],
      trim: true,
      required: false,
      maax: 50,
    },
    nextSteps: {
      type: String,
      enum: [
        "Be born Again",
        "Be baptized",
        "Join a discipleship class",
        "Speak in tongues",
      ],
      trim: true,
      required: false,
      max: 32,
    },
    getInvolved: {
      type: String,
      enum: ["Become a member", "Joining a service unit", "Follow online only"],
      trim: true,
      required: false,
      max: 32,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: String,
    role: {
      type: String,
      default: "subscriber",
    },
    refreshToken: String,
    resetPasswordLink: {
      type: String,
      default: "",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },

  { timestamps: true }
);
// virtual
userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })

  .get(function () {
    return this._password;
  });

// methods
userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },

  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
};

module.exports = mongoose.model("User", userSchema);
