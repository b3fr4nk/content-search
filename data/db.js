/* eslint-disable max-len */
/* eslint-disable new-cap */
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

const upsert = async (str, id, namespace, path) => {
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
          filepath: path,
        },
      },
    ],
    namespace: namespace,
  };

  const upsertResponse = await index.upsert({upsertRequest: upsertRequest});
  const end = Date.now();
  return end - start;
};

const query = async (query, namespace) => {
  pinecone = await init();
  // eslint-disable-next-line new-cap
  const index = pinecone.Index('content-search');

  const vector = await tokenize(query);

  const queryRequest = {
    vector: vector,
    topK: 3,
    includeValues: true,
    includeMetadata: true,
    namespace: namespace,
  };

  const queryResponse = await index.query({queryRequest: queryRequest});
  // console.log(queryResponse);
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
      .then((res, err) => {
        if (!err) {
          // console.log(res);
        } if (err) {
          console.log(err);
        }
      });
};

const deleteAll = async (namespace) => {
  const pinecone = await init();

  // eslint-disable-next-line new-cap
  const index = pinecone.Index('content-search');

  await index.delete1({
    deleteAll: true,
    namespace,
  });
};

const estimatePineconeDocCount = async (namespace) => {
  const pinecone = await init();

  const index = pinecone.Index('content-search');
  const describeIndexStatsQuery = {filter: {}, describeIndexStatsRequest: {}};

  const results = (await index.describeIndexStats(describeIndexStatsQuery)).totalVectorCount;

  return await results;
};

const estimateSQLDocCount = async () => {
  const client = await initSQL();

  client.connect();
  const results = (await client.query('SELECT COUNT(*) FROM docs')).rows[0].count;

  return await results;
};

// eslint-disable-next-line max-len
module.exports = {upsert, query, init, sqlQuery, sqlUpload, deleteAll, estimatePineconeDocCount, estimateSQLDocCount};
