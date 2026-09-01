import pool from "../config/db.js";

import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../services/authService.js";


// ============================================================
// REGISTER
// ============================================================

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    // Validate role
    const allowedRoles = ["manager", "staff"];

    const selectedRole = role || "staff";

    if (!allowedRoles.includes(selectedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected.",
      });
    }

    // Check existing user
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email.trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await pool.query(
      `
      INSERT INTO users
      (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        email,
        role,
        is_active,
        created_at
      `,
      [
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        selectedRole,
      ]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user,
    });

  } catch (error) {

    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the account.",
    });
  }
};


// ============================================================
// LOGIN
// ============================================================

export const login = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        password,
        role,
        is_active
      FROM users
      WHERE LOWER(email) = LOWER($1)
      `,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    // Check active status
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    // Compare password
    const passwordMatch = await comparePassword(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = generateToken(user);

    // Never send password to frontend
    delete user.password;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user,
    });

  } catch (error) {

    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in.",
    });
  }
};