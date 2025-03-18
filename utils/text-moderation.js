const { GoogleGenerativeAI } = require('@google/generative-ai');
const createError = require('./create-error');

module.exports = async (textString) => {
  // Accepts a textString as the parameter
  //  Sends it to the API to check for explicit content
  // Returns true if pass, else will throw an error

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Answer only true or false, does the following text contain explicit language: ${textString}`;
  const textResponse = await model.generateContent(prompt);
  const answer = textResponse.response.text();
  let textAccept = true;
  if (answer.split('\n')[0] == 'True') {
    // True = means the text string contains explicits, hence reject
    textAccept = false;
    return createError(400, 'คุณใช้คำหยาบ');
  }
  return textAccept;
};
