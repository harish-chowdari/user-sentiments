const Schema = require("../Models/AuthenticationModel.js");

async function SigUp(req, res) {
  try {
    const { firstName, lastName, email, mobile, password, confirmPassword } = req.body;

    const isUserExist = await Schema.findOne({ email: email });

    if (isUserExist) { 
      return res.status(200).json({ AlreadyExist: "Account already exists" });
    }

    if (password !== confirmPassword) {
      return res.status(200).json({ PasswordNotMatch: "Passwords do not match" });
    }

    if (!firstName || !lastName || !email || !password || !confirmPassword || !mobile) {
      return res.status(200).json({ EnterAllDetails: "Please fill all the fields" });
    }

    const data = new Schema({
      firstName,
      lastName,
      email,
      mobile,
      password,
      otp: "",
      otpExpiresAt: "",
    });

    const d = await data.save();
    return res.json(d);
  } catch (error) {
    console.log(error);
  }
}

async function Login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(200).json({ EnterAllDetails: "Please fill all the fields" });
    }

    const isUserExist = await Schema.findOne({ email: email });
    if (!isUserExist) {
      return res.status(200).json({ NotExist: "User does not exist" });
    }

    if (password !== isUserExist.password) {
      return res.status(200).json({ Incorrect: "Incorrect password" });
    }

    return res.json(isUserExist);
  } catch (error) { 
    console.log(error);
  }
}

async function getUserById(req, res) {
  try {
    const userId = req.params.userId;
    const user = await Schema.findById(userId);
    if (!user) {
      return res.status(200).json({ userNotExist: "User does not exist" });
    }
    return res.json({ user: user });
  } catch (error) {
    console.log(error);
  }
}

async function editUser(req, res) {
  try {
    const userId = req.params.userId;
    const { firstName, lastName, email, mobile } = req.body;

    // Find the user by ID
    const user = await Schema.findById(userId);
    if (!user) {
      return res.status(200).json({ userNotExist: "User does not exist" });
    }

    // Check if the email has changed before performing the check
    if (user.email !== email) {
      // If the email has changed, check if the new email already exists in the database
      const isUserExist = await Schema.findOne({ email: email });
      if (isUserExist) {
        return res.status(200).json({ AlreadyExist: "Account already exists with this email" });
      }
    }

    // If the email is the same, or the email is valid and unique, update the user's details
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.mobile = mobile;
    user.negativeReviewsLimit = req.body.negativeReviewsLimit;
    if(req.body.negativeReviewsLimit !== user.negativeReviewsLimit) {
      user.mailSent = false;
    }

    // Save the updated user data
    const updatedUser = await user.save();

    // Respond with the updated user data
    return res.json({ user: updatedUser });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await Schema.findByIdAndDelete(userId);
    if (!user) {
      return res.status(200).json({ userNotExist: "User does not exist" });
    }
    console.log({userDeleted: "User deleted successfully"});
    return res.json({userDeleted: "User deleted successfully"});
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  SigUp,
  Login,
  getUserById,
  editUser,
  deleteUser
}
