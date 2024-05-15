const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');
const { checkUserAccess } = require('../middleware/checkUserAccess');

router.get('/', auth, checkRole(['admin']), userController.getAllUsers);
router.get('/:id', auth, checkUserAccess(), userController.getUserById);
router.get('/:id/subusers', auth, checkUserAccess(), userController.getSubUserById);
router.post('/', auth, checkRole(['admin', 'user']), userController.createUser);
router.put('/:id', auth, checkUserAccess(), userController.updateUser);
router.delete('/:id', auth, checkUserAccess(), userController.deleteUser);

router.post('/login', userController.loginUser);
router.post('/logout', auth, userController.logoutUser);
router.post('/change-password', auth, userController.changePassword);
router.post('/reset-password', auth, checkRole(['admin']), userController.resetPassword);

module.exports = router;
