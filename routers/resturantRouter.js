const express = require('express');
const router = express.Router();

const {sendRestaurant,allRestaurants,singleRestaurant,deleteRestaurant} = require('../controllers/resturantController');
const {authenticateSender}=require('../middlewares/authMiddleware')
// Routes
router.post('/send',authenticateSender, sendRestaurant);
router.get('/all', allRestaurants);
router.get('/:id', singleRestaurant);
router.delete('/:id', deleteRestaurant);

module.exports = router;
