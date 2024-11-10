const express = require("express");
const { SigUp, Login, getUserById, editUser, deleteUser } = require("../Controllers/AuthenticationController");
const router = express.Router();


router.post("/signup", SigUp);

router.post("/login", Login);

router.get("/user/:userId", getUserById);

router.put("/edit-user/:userId", editUser);

router.delete("/delete-user/:userId", deleteUser);


 
module.exports = router;
