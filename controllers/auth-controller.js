const prisma = require('../models/index')

const { clerkClient } = require('@clerk/express');

const authController = {};


authController.registerUser = async (req, res, next) => {
  try {
    const { clerkID, firstName, lastName, email, phone, profilePicture } =req.body

    console.log(req.body)

    if (!clerkID || !firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const checkExist = await prisma.user.findFirst({
      where: {
        userId : clerkID
      }
    })

    if (checkExist === null) {
      const result = await prisma.user.create({
        data : {
          userId: clerkID,
          firstName: firstName,
          lastName: lastName,
          email: email,
          phoneNumber: phone,
          profilePicture: profilePicture,
          isCompleted: true
        }
      })
    }

    const updateClerkinfo = await clerkClient.users.updateUser(clerkID, {
      firstName,
      lastName,
      phoneNumbers: [phone], // Update phone number
    });

    const updatedUserMetadata = await clerkClient.users.updateUserMetadata(clerkID, {
      publicMetadata: {
        role: "USER",
        isCompleted: true,
      },
    });


    res.status(200).json({ message: "Create USER Successfully" })

  } catch (error) {
    console.log("ERROR RegistUser", error)
    next(error);
  }
};


authController.registerProvider = async (req, res, next) => {
  try {
    console.log('RegisterProvider is invoked')

    const {
      clerkID,
      userId, // Clerk user ID, passed from client
      firstName,
      lastName,
      email,
      phone,
      accountType, // Personal or Company
      companyName,
      address,
      city,
      district,
      zipCode,
      qualification, // File upload handling needed
      skill,
      identificationNumber,
      identificationPhoto, // File upload handling needed
      bankName,
      bankAccount,
      latitude, // Add to your form and client request
      longitude, // Add to your form and client request
    } = req.body;

    console.log(clerkID)
    console.log(userId)

    console.log('req.body', req.body)

    // Check if the user already exists as a provider
    const existingProvider = await prisma.provider.findUnique({
      where: {
        email: email,
      },
    });

    if (existingProvider) {
      return res.status(400).json({ error: 'Provider with this email already exists' });
    }

    // Create the provider record
    const provider = await prisma.provider.create({
      data: {
        providerId: clerkID, // Use Clerk user ID as providerId
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phone,
        companyName: accountType === 'Company' ? companyName : null,
        personalVerification: accountType === 'Personal' ? true : false,
        qualificationVerification: true, // Placeholder; implement file upload and verification
        companyVerification: accountType === 'Company' ? true : false, // Placeholder; implement file upload and verification
        skills: skill,
        latitude: parseFloat(latitude), // Ensure these are decimals
        longitude: parseFloat(longitude),
        isCompleted: true, // Mark as completed after all steps are done.
        // Documents: {
        //   create: [
        //     {
        //       documentType: 'Qualification',
        //       documentUrl: qualification, // Placeholder; store file URL
        //     },
        //     {
        //       documentType: 'Identification',
        //       documentUrl: identificationPhoto, // Placeholder; store file URL
        //     },
        //     {
        //       documentType: 'Bank Account',
        //       documentUrl: bankAccount,
        //     }
        //   ],
        // },
      },
    });

    const updateClerkinfo = await clerkClient.users.updateUser(clerkID, {
      firstName,
      lastName,
      phoneNumbers: [phone], // Update phone number
    });

    const updateProviderMetadata = await clerkClient.users.updateUserMetadata(clerkID, {
      publicMetadata: {
        role: "PROVIDER",
        isCompleted: true,
      },
    });

    res.status(201).json(provider);
  } catch (error) {
    console.log(error)
    next(error)
  }
}

module.exports = authController;
