const { Router } = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const router = Router();

router.get('/rating/:id',adminController.getRating)
router.get('/getContestData/:id',adminController.getContestRank)

module.exports = router;