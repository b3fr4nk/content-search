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
  const index = pinecone.Index('content-search');

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
  const index = pinecone.Index('content-search');

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
    port: 5432,
    database: 'contentsearch',
    user: 'postgres',
    password: process.env.SQL_PASSWORD,
  });

  return client;
};

const sqlQuery = async (query) => {
  const client = await initSQL();
  client.connect();

  const result = await client.query(query);

  return await result;
};

const sqlUpload = (doc, id) => {
  const client = initSQL();
  client.connect();

  const text = 'INSERT INTO docs (doc, p_id) VALUES ($1, $2) Returning *';
  const values = [doc, id];

  const res = client.query(text, values)
      .then((err, res) => {
        if (!err) {
          console.log(res);
        } else {
          console.log(err);
        }
      });
};

module.exports = {upsert, query, init, sqlQuery, sqlUpload};
