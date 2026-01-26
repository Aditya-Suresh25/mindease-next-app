import { Router } from "express";
import { register, login, logout, updateProfile, googleAuth } from "../controllers/authController"

//middleware - basically checkpoints
import { auth } from "../middleware/auth";

const router = Router();

//POST /auth/register
router.post("/register", register);

//POST /auth/login
router.post("/login", login);

//POST /auth/google - OAuth with Google
router.post("/google", googleAuth);

//POST /auth/logout
router.post("/logout", auth, logout);

//GET /auth/me
router.get("/me", auth, (req, res) => {
    res.json({ user: req.user })
})

//PUT /auth/me
router.put("/me", auth, updateProfile);

export default router;