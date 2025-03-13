const prisma = require('../models/index');
const createError = require('../utils/create-error');
const documentController = {};

documentController.createDocument = async (req, res, next) => {
  try {
    const { type, url, providerId } = req.body;

    const result = await prisma.documents.create({
      data: {
        type,
        url,
        providerId,
      },
    });

    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
};

documentController.getDocuments = async (req, res, next) => {
  try {
    const { take: take2, skip: skip2 } = req.query;

    const take = take2 ? Number(take2) : undefined;
    const skip = skip2 ? Number(skip2) : undefined;

    const results = await prisma.documents.findMany({
      take,
      skip,
    });

    res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

documentController.getDocumentById = async (req, res, next) => {
  try {
    const { docId } = req.params;

    const result = await prisma.documents.findFirst({
      where: {
        docId: Number(docId),
      },
    });

    if (!result) {
      return createError(400, 'This record does not exists');
    }

    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
};

documentController.deleteDocument = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const userId = req.auth.userId;

    const ifExist = await prisma.documents.findFirst({
      where: {
        docId: Number(docId),
      },
    });

    if (ifExist) {
      return createError(400, 'This document does not exist');
    }

    if (ifExist.providerId != userId) {
      return createError(400, 'Unauthorized');
    }

    const result = await prisma.documents.delete({
      where: {
        docId: Number(docId),
      },
    });
    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
};

documentController.verifyDocument = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const { approval } = req.body;
    const adminId = req.auth.userId;

    const ifDocExist = await prisma.documents.findFirst({
      where: {
        docId: Number(docId),
      },
    });

    if (!ifDocExist) {
      return createError(400, 'Document does not exist');
    }

    const docResult = await prisma.documents.update({
      where: {
        docId: Number(docId),
      },
      data: {
        approval,
        adminId,
      },
    });

    // If Document verification is completed, trigger the necessary changes in the provider's profile

    const ifProviderExist = await prisma.provider.findFirst({
      where: {
        providerId: docResult.providerId,
      },
    });

    if (!ifProviderExist) {
      return createError(400, 'User does not exist');
    }

    const personalVerification = docResult.type == 'NATIONALID' ? true : undefined;
    const qualificationVerification = docResult.type == 'QUALIFICATION' ? true : undefined;
    const companyVerification = docResult.type == 'COMPANYREGIS' ? true : undefined;

    const provider = await prisma.provider.update({
      where: {
        providerId: docResult.providerId,
      },
      data: {
        personalVerification,
        qualificationVerification,
        companyVerification,
      },
    });

    res.status(200).json({ result: docResult });
  } catch (error) {
    next(error);
  }
};

module.exports = documentController;
