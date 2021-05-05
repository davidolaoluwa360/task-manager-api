const mongoose = require('mongoose');
const validator = require('validator/validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email field is required');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error("You cannot use 'password' as your password");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          const error = new Error('Age must not be a negative number');
          throw error;
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
});

//* Hash user password before saving it to the db if modified
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    try {
      user.password = await bcrypt.hash(user.password, 12);
    } catch (err) {
      throw err;
    }
  }
  next();
});

//* Remove task when user is been removed
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

//* Authenticate User
userSchema.statics.findByCredentials = async function ({ email, password }) {
  const user = await this.findOne({ email: email });
  if (!user) {
    const error = new Error('User do not exist in our database');
    error.statusCode = 404;
    throw error;
  }

  const isUser = await bcrypt.compare(password, user.password);
  if (!isUser) {
    const error = new Error(
      'Email or password do not exist in our credentials'
    );
    error.statusCode = 500;
    throw error;
  }
  return user;
};

//* Generate jwt token for a user
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: '1 days',
    }
  );
  user.tokens = user.tokens.concat({ token: token });
  await user.save();
  return token;
};

//* Transform user returned data
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
