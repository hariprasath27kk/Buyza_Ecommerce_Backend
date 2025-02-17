const express = require('express')
const router = express.Router()

const AuthController = require('../controller/AuthController')
const verifyToken = require('../middleware/AuthMiddleware');
const { upload } = require('../middleware/Multer');

router.post("/form/register",AuthController.register);
router.post("/form/login",AuthController.login);
router.put("/form/update/:id",verifyToken,AuthController.updateUsers);

router.get("/form/getuser",verifyToken,AuthController.getUser);
router.post("/form/updateuserprofile",upload,verifyToken,AuthController.updateUserProfile);


router.get("/form/getalldetails",verifyToken,AuthController.getalldetails)

router.post("/form/verifyemail",AuthController.verifyemail)
router.post("/form/verifyotp",AuthController.verifyotp)
router.put("/form/updatepassword",AuthController.updatePassword)




router.delete("/form/delete/:id",AuthController.deleteUser)


module.exports = router

