const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')
const nodemailer = require('nodemailer');
const CartModel = require('../models/CartModel');
const TempCartModel = require('../models/TempCartModel');
const path = require('path');


//register
exports.register = async (req, res) => {
    try {
        console.log("register method")
        const { username, password, email, country, gender, roll, ip } = req.body;

        console.log("body", req.body)
        // Validation
        if (!username || !password || !email || !country || !gender) {
            return res.status(400).json({ message: "Username, password, and email are required." });
        }

        // Check if the user already exists (you may want to adjust this logic based on your requirements)
        const existingUser = await User.findOne({ email });
        console.log("existingUser", existingUser)
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email." });
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create a new user
        const user = new User({ username, password: hashedPassword, email, country, gender, status: "new", roll, ip });
        await user.save();
        console.log("user", user);
        res.status(200).json({ message: 'User register successfully' })
    } catch (error) {
        // Handle unexpected errors
        console.error("Error during registration:", error);
        res.status(500).json({ message: 'Register failed' })
    }

}

//login
exports.login = async (req, res) => {
    try {
        const { email, password, roll, ip } = req.body;

        console.log('IP in login:', ip);

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email, roll });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const payload = {
            userId: user._id,
            username: user.username,
            email: user.email,
            country: user.country,
            gender: user.gender
        };
        const token = jwt.sign(payload, 'this-can-be-any-random-key',{expiresIn:"24h"});

        // Shift cart data from TempCart to UserCart
        await shiftCartData(ip, user._id);

        // Respond with token
        res.status(200).json({ token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
};

//shifted in temp to cart
const shiftCartData = async (ip, userID) => {
    try {
        console.log('UserID for shifting:', userID);

        // Find all temp cart items for the given IP address
        const tempCartItems = await TempCartModel.find({ ip });
        console.log(tempCartItems, "tempCartItems");

        if (tempCartItems.length > 0) {
            // Map each temp cart item to include the userID
            const userCartItems = tempCartItems.map(item => ({
                ...item.toObject(),
                userID,
            }));
            console.log("userCartItems", userCartItems);


            // Insert mapped items into the CartModel
            await CartModel.insertMany(userCartItems);

            // Delete temp cart items for the IP address
            await TempCartModel.deleteMany({ ip });

            console.log('Cart data shifted successfully from TempCart to UserCart');
        }
    } catch (error) {
        console.error('Error shifting cart data:', error);
        throw new Error('Error shifting cart data');
    }
};

//get the user
exports.getUser = (req, res) => {
    const userId = req.userId;
    console.log("userId===", userId);
    User.findById(userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(200).send(user);
        }).catch((err) => {
            console.error('Error fetching user details:', err);
            return res.status(500).send('Error fetching user details');
        });
}

// Delete a user by ID
exports.deleteUser = (req, res) => {
    const Id = req.params.id;
    User.findByIdAndDelete(Id)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        })
        .catch(err => {
            res.status(500).json({ message: err.message });
        });
}

exports.verifyemail = async (req, res) => {
    console.log('forget password');
    const email = req.body.email;
    console.log("email", email);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("user not available");
            return res.status(400).send({ message: "user not found" });
        }

        // Generate a 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        console.log("otp", otp);

        // Set OTP and expiry time (10 minutes from now)
        user.otp = otp;
        user.otpExpiry = Date.now() + 1 * 60 * 1000;

        await user.save();

        // Send OTP via email using Nodemailer
        const sendMail = async () => {
            const transporter = nodemailer.createTransport({
                host: "smtp.hostinger.com",
                port: 465,
                secure: true,
                auth: {
                    user: "saravanan@wearedev.team",
                    pass: "NpBkV5jlr8-WeAlwin",
                },
            });

            const info = await transporter.sendMail({
                from: 'saravanan@wearedev.team',
                to: email,
                subject: "OTP Verification",
                text: `Your OTP for verification is: ${otp}`,
                html: `<p>Your OTP for verification is: ${otp}</p>`, // html body
            });

            console.log("Message sent: %s", info.messageId);
        };

        sendMail();
        return res.status(200).send({ user, otp: otp });
    } catch (err) {
        console.log("error", err);
        return res.status(500).send({ message: "Internal server error" });
    }
};

exports.verifyotp = async (req, res) => {
    const { otp, email } = req.body;
    console.log("confirm otp ", otp);
    try {
        const user = await User.findOne({ email, otp });
        if (!user) {
            return res.status(404).send({ message: "User not found or OTP is invalid" });
        }

        // Check if OTP has expired
        console.log("user.otpExpiry < Date.now()", user.otpExpiry < Date.now());
        if (user.otpExpiry < Date.now()) {
            return res.status(500).send({ message: "OTP has expired" });
        }

        console.log("user", user);
        return res.status(200).send({ message: "OTP verified successfully", user: user });
    } catch (err) {
        console.error("Error verifying OTP:", err);
        return res.status(500).send({ message: "Internal server error" });
    }
};

exports.updatePassword = async (req, res) => {
    const { userid, password } = req.body;
    // const userid = req.userId;

    try {
        console.log("pass", password);
        const user = await User.findById(userid);
        console.log("user  =", user);

        if (!user) {
            return res.status(400).send({ message: "user not found" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).send({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        return res.status(500).send({ message: "Internal server error" });

    }

}

exports.updateUserProfile = async (req, res) => {
    console.log("update call");

    // console.log("req+++++++++++updateProfile", req?.file);
    // return;
    try {
        let msg = "Found Successfull";
        const userid = req.userId;
        const { name } = req.body;
        // console.log("req.file=====", req.file.originalname);

        // console.log("updateuser", name);
        // console.log("userid", userid);

        if (req.file !== undefined) {
            // const image = req.file.originalname;

            const image = random + path.extname(req.file.originalname);
            console.log("image", image)
            msg = "Image Updated Succesfully"
            const userUpdate = await User.findOneAndUpdate(
                { _id: userid },
                { $set: { image: image, role: 'olduser' } },
                { new: true });
            console.log(userUpdate, 'userUpdate in user image' );
            // return res.status(200).send({
            //     message: msg,
            //     result: userUpdate

            // })
        }
        if (name !== undefined) {
            msg = "User Profile Updated Succesfully"
            const userUpdate = await User.findOneAndUpdate({ _id: userid }, { role: 'olduser', username: name }, { new: true });
            console.log(userUpdate, 'userUpdate in user name');
            
            return res.status(200).send({
                message: msg,
                result: userUpdate
            })
        }

        const user = await User.findOne({ _id: userid })
        // console.log("user", user);

        if (!user) {
            return { message: "not found", status: 400 }
        }

        return res.status(200).send({
            result: user,
            message: msg
        });
    } catch (error) {
        return res.status(500).send("Error updating user: " + error.message);
    }
}


//findby username
exports.findbyusername = async (req, res) => {
    console.log("req----------", req.params.username);
    const userName = req.params.username;

    await User.find({ userName: userName })
        .then((user) => {
            console.log("res--user------", user);
            return res.status(200).send(user)
        }).catch((err) => {
            return res.status(200).send(err.message)
        })
}

exports.getalldetails = async (req, res) => {
    try {

        const userid = req.userId;

        if (userid) {
            try {
                const users = await User.find();
                res.status(200).json(users);
            } catch (err) {
                console.log('Error fetching users:', err);
                res.status(400).json({ error: err.message });
            }
        } else {
            console.log("User ID not found");
            res.status(500).json({ error: "User ID not found" });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: "Unexpected error occurred" });
    }
}


exports.updateUsers = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log("userId:", userId);
        console.log("Request body:", req.body);

        const { username, email, password, country, gender, roll, role } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            {
                username,
                email,
                password,
                country,
                gender,
                roll,
                role,
                updatedAt: Date.now(),
            },
            { new: true }
        );

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: "User not found" });
        }

        console.log("User updated:", user);
        res.status(200).send(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: error.message });
    }
};
