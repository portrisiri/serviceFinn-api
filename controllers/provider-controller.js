const prisma = require('../models/index')
const { requireAuth } = require('@clerk/express'); 

const providerController = {};


providerController.getAllProviders = async (req, res, next) => {
  try {
    const providers = await prisma.provider.findMany();
    res.status(200).json({
      success:true,message:'hello',
      providers
    })
  } catch (error) {
    next(error);
  }
};

providerController.getFilteredProviders = async (req, res, next) => {
  try {
    // Extract query parameters for filtering
    const { categorySubCatId, location } = req.query;

    // Construct the filter object
    const filters = {};

    if (categoryId) {
      filters.service = {
        some: {
          categorySubCatId: parseInt(categorySubCatId), // Ensure categoryId is a number
        },
      };
    }

    if (location) {
      filters.location = location;
    }

    // Fetch providers with the applied filters
    const providers = await prisma.provider.findMany({
      where: filters,
      include: {
        service: true, // Optionally include services (or use specific fields like `categoryId`)
      },
      take: 10, // Limit the results to 10 providers
    });

    res.status(200).json({
      success: true,
      message: 'Providers fetched successfully',
      providers,
    });
  } catch (error) {
    next(error); // Pass error to the error handler
  }
};

providerController.getProviderById = async (req, res, next) => {
  try {
    const { id } = req.params; // Get providerId from URL params
    // Find a provider with the specific id
    const provider = await prisma.provider.findUnique({
      where: {
        providerId: +id, // Assuming `id` is passed as a string and needs to be parsed to an integer
      },
    });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }
    // Return the provider data if found
    res.status(200).json({
      success: true,
      message: 'Provider found',
      provider, // Send the provider data as the response
    });
  } catch (error) {
    console.log(error)
    next(error); // Pass any error to the error handler
  }
}

providerController.updateProviderProfile = async (req, res, next) => {
  try {
    const { id } = req.params; // Get providerId from URL params
    const { firstName, lastName, email, phoneNumber, companyName, profilePicture, skills, availability, location } = req.body;

    // Get the current authenticated user ID (from Clerk session)
    const userId = req.auth.userId; // Assuming Clerk middleware is set up

    // Check if the logged-in user is the owner of this provider account
    const provider = await prisma.provider.findUnique({
      where: {
        providerId: parseInt(id),
      },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    // Ensure that the authenticated user is the owner of the provider profile
    if (provider.providerId !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this provider profile',
      });
    }

    // Update the provider's profile
    const updatedProvider = await prisma.provider.update({
      where: {
        providerId: parseInt(id),
      },
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        companyName,
        profilePicture,
        skills,
        availability,
        location,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Provider profile updated successfully',
      updatedProvider,
    });
  } catch (error) {
    next(error); // Pass any error to the error handler
  }
};


providerController.activateProvider = async (req, res, next) => {
  try {
    const { id } = req.params; // Get providerId from URL params

    // Get the current authenticated user ID (from Clerk session)
    const userId = req.auth.userId; // Assuming Clerk middleware is set up

    // Find the provider by their providerId
    const provider = await prisma.provider.findUnique({
      where: {
        providerId: parseInt(id),
      },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    // Ensure that the authenticated user is the owner of the provider profile
    if (provider.providerId !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to activate this provider profile',
      });
    }

    // Update the `isActive` column to `true`
    const updatedProvider = await prisma.provider.update({
      where: {
        providerId: parseInt(id),
      },
      data: {
        isActive: true, // Set isActive to true
      },
    });

    res.status(200).json({
      success: true,
      message: 'Provider activated successfully',
      updatedProvider,
    });
  } catch (error) {
    next(error); // Pass any error to the error handler
  }
};


providerController.deactivateProvider = async (req, res, next) => {
  try {
    const { id } = req.params; // Get providerId from URL params

    // Get the current authenticated user ID (from Clerk session)
    const userId = req.auth.userId; // Assuming Clerk middleware is set up

    // Find the provider by their providerId
    const provider = await prisma.provider.findUnique({
      where: {
        providerId: parseInt(id),
      },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    // Ensure that the authenticated user is the owner of the provider profile
    if (provider.providerId !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to deactivate this provider profile',
      });
    }

    // Update the `isActive` column to `false`
    const updatedProvider = await prisma.provider.update({
      where: {
        providerId: parseInt(id),
      },
      data: {
        isActive: false, // Set isActive to false to deactivate
      },
    });

    res.status(200).json({
      success: true,
      message: 'Provider deactivated successfully',
      updatedProvider,
    });
  } catch (error) {
    next(error); // Pass any error to the error handler
  }
};



module.exports = providerController;
