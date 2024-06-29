const { Router } = require('express');
const adminController = require('../controllers/adminController');
const lcUserController = require('../controllers/lcuserController')
const auth = require('../middlewares/auth');
const router = Router();
const cookieParser = require("cookie-parser")
router.use(cookieParser());

router.get('/rating/:id',adminController.getRating)
router.post('/updateAllUsers',lcUserController.updateAllUsers)
router.post('/predictRating',lcUserController.predictRating)
router.get('/getContestRank',adminController.getContestRank)
router.get('/getAllContests',adminController.getAllContest)
router.post('/register', adminController.signup);
router.post('/login', adminController.login); 
router.get('/user',auth, adminController.get_user);
router.post('/logout',auth,adminController.logout); 

module.exports = router;