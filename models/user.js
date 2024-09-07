const mongoose = require("mongoose");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");

const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    surName: {
      type: String,
      trim: true,
      required: false,
      max: 50,
    },
    firstName: {
      type: String,
      trim: true,
      required: false,
      max: 50,
    },
    roles: {
      User: {
        type: Number,
        default: 2001, 
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
    },
    consent: {
      type: Boolean,
    },
    consentToReceiveUpdates: {
      type: Boolean,
      required: false,
    },
    birthDay: {
      type: String,
      trim: true,
      required: true,
      max: 11,
    },
    ageGroup: {
      type: String,
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
      trim: true,
      required: true,
      max: 9,
    },
    noOfChildren: {
      type: Number,
      required: false,
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
      trim: true,
      required: false,
      max: 50,
    },
    whyDidYouJoinTcnLekki: {
      type: String,
      trim: true,
      required: false,
      max: 150,
    },
    nextSteps: {
      type: String,
      trim: true,
      required: false,
      max: 32,
    },
    getInvolved: {
      type: String,
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
      type: Number,
      default: 2001,
    },
    refreshToken: String,
    resetPasswordLink: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    needsPasswordReset: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

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

userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function (password) {
    if (!password) return "";
    try {
      const saltRounds = 10; // Number of salt rounds for hashing
      return bcrypt.hashSync(password, saltRounds);
    } catch (err) {
      return "";
    }
  },

  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
};

module.exports = mongoose.model("User", userSchema);
