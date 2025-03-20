const prisma = require('../models/index');
const { requireAuth } = require('@clerk/express');
const createError = require('../utils/create-error');

const providerController = {};

// For Admin
providerController.getAllProviders = async (req, res, next) => {
  try {
    const { subCatId, orderBy, sort, skip, take, rating } = req.query;
    const providerFilters = {};
    rating && (providerFilters.providerRating = { gte: Number(rating) });
    subCatId &&
      (providerFilters.service = {
        some: {
          subCatId,
        },
      });

    const providers = await prisma.provider.findMany({
      orderBy: {
        [orderBy]: sort,
      },
      where: providerFilters,
      include: { service: true },
      skip,
      take,
    });
    res.status(200).json({
      success: true,
      message: 'hello',
      providers,
    });
  } catch (error) {
    next(error);
  }
};

// For User
providerController.getFilteredProviders = async (req, res, next) => {
  try {
    const { subCatId, latitude, longitude, radius, orderBy, sort, skip, take, date, rating } = req.query;

    // HAVING ****************************************************************************************
    // Distance
    const radiusFilter = radius ? `distance < ${radius}` : '';
    const havingFilter = radiusFilter ? `HAVING ${radiusFilter}` : '';

    // WHERE ****************************************************************************************
    const whereArray = [];
    // SubCatId
    const subCatIdFilter = subCatId ? `Service.subCatId = ${subCatId}` : '';
    subCatIdFilter && whereArray.push(subCatIdFilter);
    // Day
    const targetDay = date
      ? new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(date)).toLowerCase()
      : null;
    const dayFilter = targetDay ? `Provider.${targetDay} = true` : '';
    dayFilter && whereArray.push(dayFilter);
    // Rating
    const ratingFilter = rating ? `Provider.providerRating >= ${rating}` : '';
    ratingFilter && whereArray.push(ratingFilter);
    //
    let whereFilter = '';
    if (whereArray.length > 0) {
      whereFilter = `WHERE ${whereArray.join(' AND ')}`;
    }

    // ****************************************************************************************
    const sortFilter = sort ? `${sort}` : '';
    const orderByFilter = orderBy ? `ORDER BY ${orderBy} ${sortFilter}` : '';
    const offsetFilter = skip ? `OFFSET ${skip}` : '';
    const limitFilter = take ? `LIMIT ${take} ${offsetFilter}` : '';

    // Construct the filter object
    // const filters = {};

    // if (categorySubCatId) {
    //   filters.service = {
    //     some: {
    //       categorySubCatId: parseInt(categorySubCatId), // Ensure categoryId is a number
    //     },
    //   };
    // }

    // if (location) {
    //   filters.location = location;
    // }

    // Fetch providers with the applied filters
    // const providers = await prisma.provider.findMany({
    //   where: filters,
    //   include: {
    //     service: true, // Optionally include services (or use specific fields like `categoryId`)
    //   },
    //   take: 10, // Limit the results to 10 providers
    // });

    const count = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) AS totalRows
    FROM (
      SELECT 
        Provider.providerId AS providerId,
        Provider.latitude,
        Provider.longitude,
        Service.providerId AS serviceProviderId,
        Service.serviceId,
        (6371 * acos(cos(radians(${latitude})) 
                    * cos(radians(Provider.latitude)) 
                    * cos(radians(Provider.longitude) - radians(${longitude})) 
                    + sin(radians(${latitude})) 
                    * sin(radians(Provider.latitude)))) AS distance
      FROM Provider
      LEFT JOIN Service ON Provider.providerId = Service.providerId
      ${whereFilter}
      ${havingFilter}
    ) AS provider_distances
    `);

    // All the providers that satisfies the criteria
    const results = await prisma.$queryRawUnsafe(`
    SELECT *, (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(latitude)))) AS distance 
    FROM Provider
    LEFT JOIN Service ON Provider.providerId = Service.providerId
    ${whereFilter}
    ${havingFilter}
    ${orderByFilter}
    ${limitFilter}
    `);

    res.status(200).json({
      success: true,
      count: Number(count[0].totalRows),
      results,
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
    console.log(error);
    next(error); // Pass any error to the error handler
  }
};

providerController.updateProviderProfile = async (req, res, next) => {
  try {
    const { id } = req.params; // Get providerId from URL params
    const { firstName, lastName, email, phoneNumber, companyName, profilePicture, skills, availability, location } =
      req.body;

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
