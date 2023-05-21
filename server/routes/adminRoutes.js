const { Router } = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const router = Router();
const cookieParser = require("cookie-parser")
router.use(cookieParser());

router.get('/rating/:id',adminController.getRating)
router.get('/getContestRank/:slug',adminController.getContestRank)
router.post('/register', adminController.signup);
router.post('/login', adminController.login);
router.get('/user',auth, adminController.get_user);
router.post('/logout',auth,adminController.logout);

module.exports = router;