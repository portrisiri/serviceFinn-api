const express = require('express');
const documentController = require('../controllers/document-controller');

const documentRoute = express.Router();

documentRoute.post('/', documentController.createDocument);
documentRoute.get('/', documentController.getDocuments);
documentRoute.get('/:docId', documentController.getDocumentById);
documentRoute.delete('/:docId', documentController.deleteDocument);
documentRoute.put('/:docId', documentController.verifyDocument);

module.exports = documentRoute;
