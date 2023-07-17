const {Configuration, OpenAIApi} = require('openai');

const tokenize = async (data) => {
  const configuration = new Configuration({
    organization: 'org-ba1CIAAe8okVFHYuGSbaHSIw',
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);
  const tokens = openai.createEmbedding({
    'model': 'text-embedding-ada-002',
    'input': data,
  });

  return (await tokens).data.data[0].embedding;
};

module.exports = {tokenize};
