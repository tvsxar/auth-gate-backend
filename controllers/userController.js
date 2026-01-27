import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// Cookie options setup
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    const token = generateToken(newUser._id);

    // Set cookie
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Check if password is correct and return error if it`s incorrect
    const isValidPassword = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isValidPassword) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // Generate token and set cookies
    const token = generateToken(existingUser._id);

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      message: "Login successfully",
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
