const axios = require('axios');
 
async function getOAuthToken() {
  const tokenUrl = 'https://3c28c48atrial.authentication.us10.hana.ondemand.com/oauth/token';
  const clientId = 'sb-c27c035e-7753-485d-890a-9af4268aca21!b325995|dox-xsuaa-std-trial!b10844';
  const clientSecret = '2be5189e-4d13-4638-a2af-69be2c403589$JGpNrzi217TOVkjat01VARqiB53lMKBQn2GLuIxyiE4=';
 
  try {
    const response = await axios.post(tokenUrl, null, {
      params: {
        grant_type: 'client_credentials'
      },
      auth: {
        username: clientId,
        password: clientSecret
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
 
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching OAuth token:', error.response ? error.response.data : error.message);
    throw new Error('Failed to obtain OAuth token');
  }
}
 
module.exports = getOAuthToken;