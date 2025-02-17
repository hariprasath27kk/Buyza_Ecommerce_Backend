const express = require('express')

const TransectionController = require('../controller/TransectionController')

const router = express.Router();

router.post("/file/transection",TransectionController.sendDetails)
router.get("/file/transactions",TransectionController.getTransactions)

module.exports = router
