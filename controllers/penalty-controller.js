const penaltyController = {};

penaltyController.createPenalty = async (req, res, next) => {
  try {
    const { bookingId, userId, providerId, reason } = req.body;

    // Validate input (ensure bookingId, userId, providerId are provided)
    if (!bookingId || !userId || !providerId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the booking exists
    const bookingExists = await prisma.booking.findUnique({
      where: { bookingId: parseInt(bookingId) },
    });

    if (!bookingExists) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Optional: Validate if the user or provider exists
    const userExists = await prisma.user.findUnique({
      where: { userId: parseInt(userId) },
    });

    const providerExists = await prisma.provider.findUnique({
      where: { providerId: parseInt(providerId) },
    });

    if (!userExists || !providerExists) {
      return res.status(404).json({ message: "User or provider not found" });
    }

    // Create the penalty without manually including penaltyDuration, dateApplied, or expiryDate
    const newPenalty = await prisma.penalty.create({
      data: {
        bookingId: parseInt(bookingId),
        userId: parseInt(userId),
        providerId: parseInt(providerId),
        reason: reason || "No reason provided", // Default reason if none provided
        // Do NOT include penaltyDuration, dateApplied, or expiryDate
      },
    });

    res.status(201).json({ message: "Penalty created successfully", penalty: newPenalty });
  } catch (error) {
    next(error);
  }
};

penaltyController.adminApprove = async (req, res, next) => {
  try {
    const { penaltyDuration, dateApplied, expiryDate } = req.body;
    const { penaltyId } = req.params;  // Get penaltyId from route parameter

    // Ensure the user is an admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Unauthorized. Admin access required." });
    }

    // Validate input (ensure at least one of the fields is provided)
    if (!penaltyId) {
      return res.status(400).json({ message: "Penalty ID is required" });
    }

    // Fetch the penalty to ensure it exists
    const penalty = await prisma.penalty.findUnique({
      where: { penaltyId: parseInt(penaltyId) },
    });

    if (!penalty) {
      return res.status(404).json({ message: "Penalty not found" });
    }

    // Prepare the update data
    const updateData = {};

    if (penaltyDuration) {
      updateData.penaltyDuration = parseInt(penaltyDuration);
    }

    if (dateApplied) {
      updateData.dateApplied = new Date(dateApplied);  // Ensure it's a valid Date
    }

    if (expiryDate) {
      updateData.expiryDate = new Date(expiryDate);  // Ensure it's a valid Date
    }

    // Perform the update
    const updatedPenalty = await prisma.penalty.update({
      where: { penaltyId: parseInt(penaltyId) },
      data: updateData,
    });

    res.status(200).json({ message: "Penalty updated successfully", penalty: updatedPenalty });
  } catch (error) {
    next(error);
  }
};



penaltyController.adminGetAllPenalty = async (req, res, next) => {
  try {
    // Ensure the user is an admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Unauthorized. Admin access required." });
    }

    // Fetch all penalties from the database
    const penalties = await prisma.penalty.findMany({
      include: {
        booking: true,   // Include booking details if needed
        user: true,      // Include user details if needed
        provider: true,  // Include provider details if needed
      },
    });

    // Return the list of penalties
    res.status(200).json({ message: "Penalties retrieved successfully", penalties });
  } catch (error) {
    next(error);
  }
};


penaltyController.adminGetPenalty = async (req, res, next) => {
  try {
    const { penaltyId } = req.params;  // Get penaltyId from route parameter

    // Ensure the user is an admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Unauthorized. Admin access required." });
    }

    // Fetch the specific penalty by ID
    const penalty = await prisma.penalty.findUnique({
      where: { penaltyId: parseInt(penaltyId) },
    });

    if (!penalty) {
      return res.status(404).json({ message: "Penalty not found" });
    }

    // Return the penalty details
    res.status(200).json({ message: "Penalty fetched successfully", penalty });
  } catch (error) {
    next(error);
  }
};



penaltyController.userGetPenalty = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Assuming userId is available in the authenticated user (e.g., via JWT)

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Fetch penalties for the authenticated user
    const penalties = await prisma.penalty.findMany({
      where: {
        userId: userId,  // Only fetch penalties created by the authenticated user
      },
      include: {
        booking: true,   // Include booking details if needed
        provider: true,  // Include provider details if needed
      },
    });

    if (penalties.length === 0) {
      return res.status(404).json({ message: "No penalties found for this user" });
    }

    // Return the list of penalties
    res.status(200).json({ message: "Penalties retrieved successfully", penalties });
  } catch (error) {
    next(error);
  }
};

module.exports = penaltyController;




// penaltyController.userGetPenalty = async (req,res,next)=>{
//   try{

//   } catch(error){
//     next(error)
//   }
// }