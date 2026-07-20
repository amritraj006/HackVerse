const { uploadBuffer } = require('../utils/cloudinary');
const APIResponse = require('../utils/apiResponse');
const APIError = require('../utils/apiError');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new APIError('No image file provided', 400);
    }

    // Determine folder name based on type query parameter
    let folder = 'hackverse/general';
    const type = req.query.type;
    if (type === 'profile') {
      folder = 'hackverse/profiles';
    } else if (type === 'hackathon') {
      folder = 'hackverse/hackathons';
    } else if (type === 'team') {
      folder = 'hackverse/teams';
    }

    const uploadResult = await uploadBuffer(req.file.buffer, folder);

    res.status(200).json(
      new APIResponse(
        200,
        {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
        },
        'Image uploaded successfully to Cloudinary'
      )
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
};
