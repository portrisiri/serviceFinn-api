const serviceController = {};

serviceController.getAllServicesByProviderId = async (req, res, next) => {
  try {
    const { providerId } = req.params;

    // Ensure providerId is a valid number
    if (!providerId || isNaN(providerId)) {
      return res.status(400).json({ message: 'Invalid providerId' });
    }

    const services = await prisma.service.findMany({
      where: { providerId: parseInt(providerId) },
      include: {
        category: true, // Include related category
      },
    });

    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
};

serviceController.getAllServices = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        provider: true, // Include provider details
        booking: true, // Include related bookings
        subCatName: true, // Include category details (subCatName relation)
      },
    });
    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
};

serviceController.getServiceById = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    // Ensure serviceId is a valid number
    if (!serviceId || isNaN(serviceId)) {
      return res.status(400).json({ message: 'Invalid serviceId' });
    }

    const service = await prisma.service.findUnique({
      where: { serviceId: parseInt(serviceId) },
      include: {
        provider: true, // Include provider details
        category: true, // Include category details
      },
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json(service);
  } catch (error) {
    next(error);
  }
};

serviceController.createService = async (req, res, next) => {
  try {
    const { providerId, categoryId, serviceName, price } = req.body;

    // Validate required fields
    if (!providerId || !categoryId || !serviceName || price === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Ensure numeric values are valid
    if (isNaN(providerId) || isNaN(categoryId) || isNaN(price)) {
      return res.status(400).json({ message: 'Invalid providerId, categoryId, or price' });
    }

    // Check if provider exists
    const providerExists = await prisma.provider.findUnique({
      where: { providerId: parseInt(providerId) },
    });

    if (!providerExists) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { subCatId: parseInt(categoryId) }, // Using subCatId as per your schema
    });

    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create the service
    const newService = await prisma.service.create({
      data: {
        providerId: parseInt(providerId),
        categoryId: parseInt(categoryId),
        serviceName,
        price: parseFloat(price),
      },
    });

    res.status(201).json({ message: 'Service created successfully', service: newService });
  } catch (error) {
    next(error);
  }
};

serviceController.deleteServiceById = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const providerId = req.user?.providerId; // Assuming providerId comes from authentication middleware

    // Validate input
    if (!serviceId || isNaN(serviceId)) {
      return res.status(400).json({ message: 'Invalid serviceId' });
    }
    if (!providerId || isNaN(providerId)) {
      return res.status(403).json({ message: 'Unauthorized: Only service owners can delete' });
    }

    // Check if the service exists and belongs to the authenticated provider
    const service = await prisma.service.findUnique({
      where: { serviceId: parseInt(serviceId) },
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.providerId !== providerId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own service' });
    }

    // Delete the service
    await prisma.service.delete({
      where: { serviceId: parseInt(serviceId) },
    });

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

serviceController.updateServiceById = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const providerId = req.user?.providerId; // Extract providerId from authentication middleware
    const { serviceName, price } = req.body;

    // Validate input
    if (!serviceId || isNaN(serviceId)) {
      return res.status(400).json({ message: 'Invalid serviceId' });
    }
    if (!providerId || isNaN(providerId)) {
      return res.status(403).json({ message: 'Unauthorized: Only service owners can update' });
    }

    // Check if the service exists and belongs to the authenticated provider
    const service = await prisma.service.findUnique({
      where: { serviceId: parseInt(serviceId) },
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.providerId !== providerId) {
      return res.status(403).json({ message: 'Unauthorized: You can only update your own service' });
    }

    // Update the service
    const updatedService = await prisma.service.update({
      where: { serviceId: parseInt(serviceId) },
      data: {
        serviceName: serviceName || service.serviceName, // Keep old value if not provided
        price: price !== undefined ? parseFloat(price) : service.price,
      },
    });

    res.status(200).json({ message: 'Service updated successfully', service: updatedService });
  } catch (error) {
    next(error);
  }
};

module.exports = serviceController;
