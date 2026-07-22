const Registration = require('../models/Registration');
const Hackathon = require('../models/Hackathon');

class ParticipantService {
  /**
   * Register participant for a hackathon
   */
  async registerForHackathon(hackathonId, participantId) {
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      const error = new Error('Hackathon not found');
      error.statusCode = 404;
      throw error;
    }

    if (!hackathon.isRegistrationOpen) {
      const error = new Error('Registrations for this hackathon are currently closed');
      error.statusCode = 400;
      throw error;
    }

    if (hackathon.status === 'ended' || hackathon.status === 'cancelled') {
      const error = new Error('Cannot register for a hackathon that has ended or been cancelled');
      error.statusCode = 400;
      throw error;
    }

    // Check for duplicate registration
    const existing = await Registration.findOne({
      hackathon: hackathonId,
      participant: participantId,
    });

    if (existing) {
      if (existing.status === 'active') {
        const error = new Error('You are already registered for this hackathon');
        error.statusCode = 409;
        throw error;
      }
      // Re-activate cancelled registration
      existing.status = 'active';
      existing.registeredAt = new Date();
      await existing.save();
      return await Registration.findById(existing._id)
        .populate('hackathon', 'title tagline status prizePool startDate endDate registrationDeadline maxTeamSize')
        .populate('participant', 'name email');
    }

    const registration = await Registration.create({
      hackathon: hackathonId,
      participant: participantId,
    });

    return await Registration.findById(registration._id)
      .populate('hackathon', 'title tagline status prizePool startDate endDate registrationDeadline maxTeamSize')
      .populate('participant', 'name email');
  }

  /**
   * Cancel participant registration for a hackathon
   */
  async cancelRegistration(hackathonId, participantId) {
    const registration = await Registration.findOne({
      hackathon: hackathonId,
      participant: participantId,
      status: 'active',
    });

    if (!registration) {
      const error = new Error('No active registration found for this hackathon');
      error.statusCode = 404;
      throw error;
    }

    registration.status = 'cancelled';
    await registration.save();
    return registration;
  }

  /**
   * Get registration history for a participant
   */
  async getMyRegistrations(participantId, { status = '', page = 1, limit = 10 }) {
    const query = { participant: participantId };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const registrations = await Registration.find(query)
      .populate(
        'hackathon',
        'title tagline status prizePool startDate endDate registrationDeadline maxTeamSize isRegistrationOpen isResultsPublished'
      )
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Registration.countDocuments(query);
    const pages = Math.ceil(total / parseInt(limit, 10)) || 1;

    return {
      registrations,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages,
        limit: parseInt(limit, 10),
      },
    };
  }

  /**
   * Check registration status for a single hackathon
   */
  async getRegistrationStatus(hackathonId, participantId) {
    const registration = await Registration.findOne({
      hackathon: hackathonId,
      participant: participantId,
    });

    return {
      isRegistered: !!registration && registration.status === 'active',
      status: registration ? registration.status : null,
      registration: registration || null,
    };
  }

  /**
   * Get registration count per hackathon (for organizer use)
   */
  async getHackathonRegistrationCount(hackathonId) {
    return await Registration.countDocuments({
      hackathon: hackathonId,
      status: 'active',
    });
  }
}

module.exports = new ParticipantService();
