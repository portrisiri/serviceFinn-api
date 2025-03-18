const express = require('express');
const documentController = require('../controllers/document-controller');

const documentRoute = express.Router();

// http://localhost:4289/document/
documentRoute.post('/', documentController.createDocument);

// http://localhost:4289/document/
documentRoute.get('/', documentController.getDocuments);

// http://localhost:4289/document/:docId
documentRoute.get('/:docId', documentController.getDocumentById);

// http://localhost:4289/document/:docId
documentRoute.delete('/:docId', documentController.deleteDocument);

// http://localhost:4289/document/:docId
documentRoute.put('/:docId', documentController.verifyDocument);

module.exports = documentRoute;
