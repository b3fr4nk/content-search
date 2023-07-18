/* eslint-disable no-unused-vars */
const {PineconeClient} = require('@pinecone-database/pinecone');
const {tokenize} = require('./openai');

const init = async () => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT,
    apiKey: process.env.PINECONE_API_KEY,
  });
  return pinecone;
};

const upsert = async (str, id) => {
  const start = Date.now();
  pinecone = await init();
  // eslint-disable-next-line new-cap
  const index = pinecone.Index('docs-search');

  const data = await tokenize(str);

  const upsertRequest = {
    vectors: [
      {
        id: id,
        values: data,
        metadata: {
          text: str,
          filepath: id,
        },
      },
    ],
    namespace: 'testing-3+1',
  };

  const upsertResponse = await index.upsert({upsertRequest: upsertRequest});
  const end = Date.now();
  return end - start;
};

const query = async (query) => {
  pinecone = await init();
  // eslint-disable-next-line new-cap
  const index = pinecone.Index('docs-search');

  const vector = await tokenize(query);

  const queryRequest = {
    vector: vector,
    topK: 3,
    includeValues: true,
    includeMetadata: true,
    namespace: 'testing-3+1',
  };

  const queryResponse = await index.query({queryRequest: queryRequest});
  console.log(queryResponse);
  return queryResponse;
};

const initSQL = () => {
  const {Client} = require('pg');

  const client = new Client({
    host: process.env.SQL_TEST,
    port: 5334,
    database: 'content-search',
    user: 'hosting-db',
  });

  return client;
};

const SQLQuery = (query) => {
  const client = initSQL();
  client.connect();

  const result = client.query(query);
  console.log(result);

  return result;
};

module.exports = {upsert, query, init, SQLQuery};
