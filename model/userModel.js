const mongoose = require("mongoose");
const Schema = mongoose.Schema; //creates a schema variable

const uuid = require("uuid").v4;

const UserSchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
            default: uuid,
        },
        firstname: {
            type: String,
            trim: true,
        },
        lastname: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validateEmail(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid email');
                }
            },
        },
        password: {
            type: String,
            required: true,
            select: false,
            trim: true,
            minlength: 8,
            private: true,
        },
        //select `false` means that password field will not appear in the backend api calls

        birthDate: {
            required: true,
            type: Date
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        role: {
            type: String,
            default: "user",
            enum: ["user", "admin"]
        },
        //enum tells mongoose that there can only be two values for role, i.e. 'user' and 'admin'

    },

    { timestamps: true, select: false, }
    //timestamps are auto added to the databse and they tell when the user was created

);

module.exports = mongoose.model("User", UserSchema);