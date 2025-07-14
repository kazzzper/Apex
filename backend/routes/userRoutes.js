const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.put('/update-plan', userController.updatePlan);
router.put('/update-info', userController.updateInfo);
router.put('/update-password', userController.updatePassword);

module.exports = router;
