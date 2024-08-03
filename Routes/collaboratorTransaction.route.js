const express = require('express');
const { sendMoney, addFunds, captureFunds, getcollaboratorTransaction, getNewCollaboratorTransaction } = require('../Controller/collaboratorTransaction.controller');
const router = express.Router();

router.post('/collaborator-send-money/:id', sendMoney);
router.post('/collaborator-add-funds', addFunds);
router.post('/collaborator-capture-funds', captureFunds);
router.get('/get/successfull/collaborator/transaction/:id', getcollaboratorTransaction);
router.get('/get/full/successfull/collaborator/transaction', getNewCollaboratorTransaction);

module.exports = router;
