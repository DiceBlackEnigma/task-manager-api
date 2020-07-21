const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/task');

const userSchema = new mongoose.Schema({
    name: {
        trim: true,
        type: String,
        required: true,
    },
    age: {
        default: 0,
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number');
            }
        }
    },
    email: {
        trim: true,
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw Error('Email is invalid');
            }
        }
    },
    password: {
        trim: true,
        type: String,
        minlength: 7,
        required: true,
        validate(value) {
            if (/password/i.test(value)) {
                throw new Error('Password cannot contain the word "password"');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({token});
    user.save();
    return token;
};

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
};

userSchema.statics.findByCredentials = async ({email, password}) => {
    const user = await User.findOne({email});
    if (!user) {
        throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Unable to login');
    }
    return user;
};

// Hash plain text password
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({owner: user._id});

    next();
});

const User = mongoose.model('User', userSchema );

module.exports = User;
