const axios = require('axios');
const createError = require('./create-error');

module.exports = async (imageURL) => {
  // Accepts an array as the parameter
  // Each item contains
  // Sends it to the API to check for explicit content
  // Returns true if pass, else will throw an error

  const imageResponse = await axios.get('https://api.sightengine.com/1.0/check-workflow.json', {
    params: {
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrGRhOBZw7obdE0Qza0M4gZ9yhO0U6e0MqYQ&s',
      workflow: 'wfl_i6USrULlrOEAjs0OpAYnd',
      api_user: '120474922',
      api_secret: 'akFCgfw68KDodj3X4EWcxAXKmNpdsXER',
    },
  });

  let imageAccept = true;
  console.log(imageResponse.data);

  if (imageResponse?.data?.summary?.action == 'reject') {
    imageAccept = false;
    return createError(400, `คุณใช้รูปภาพไม่เหมาะสม ${imageAccept.reject_reason}`);
  }
  return imageAccept;
};
