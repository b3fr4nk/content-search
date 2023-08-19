/* eslint-disable max-len */
// test/index.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const {describe, it} = require('mocha');
const app = require('../app');
const db = require('../data/db');
chai.use(chaiHttp);
const agent = chai.request.agent(app);
const path = require('path');

describe('upload', ()=> {
  // upload text
  it('Should upload text document to pinecone and postgresql', (done) => {
    const initialPineconeCount = db.estimatePineconeDocCount();
    const initialSQLDocCount = db.estimateSQLDocCount();
    agent.post('/upload/text')
        .set('content-type', 'application/x-www-form-urlencoded')
        .field('namespace', 'testing')
        .attach('doc', path.resolve('./test/files/test.txt'), 'test.txt')
        .then((result) => {
          chai.expect(result).to.have.status(200);
          db.estimatePineconeDocCount()
              .then((count) => {
                count.should.greaterThan(initialPineconeCount);
              });
          db.estimateSQLDocCount()
              .then((count) => {
                count.should.greaterThan(initialSQLDocCount);
              });

          db.deleteAll('testing');

          done();
        })
        .catch((err) => {
          done(err);
        });
  });

  it('Should upload pdf document to pineconce and postgresql', (done) => {
    const initialPineconeCount = db.estimatePineconeDocCount();
    const initialSQLDocCount = db.estimateSQLDocCount();
    agent.post('/upload/pdf')
        .set('content-type', 'application/x-www-form-urlencoded')
        .field('namespace', 'testing')
        .attach('doc', path.resolve('./test/files/test.pdf'), 'test.pdf')
        .then((result) => {
          chai.expect(result).to.have.status(200);
          db.estimatePineconeDocCount()
              .then((count) => {
                count.should.greaterThan(initialPineconeCount);
              });
          db.estimateSQLDocCount()
              .then((count) => {
                count.should.greaterThan(initialSQLDocCount);
              });

          db.deleteAll('testing');

          done();
        })
        .catch((err) => {
          done(err);
        });
  });

  it('Should upload word document to pineconce and postgresql', (done) => {
    const initialPineconeCount = db.estimatePineconeDocCount();
    const initialSQLDocCount = db.estimateSQLDocCount();
    agent.post('/upload/word')
        .set('content-type', 'application/x-www-form-urlencoded')
        .field('namespace', 'testing')
        .attach('doc', path.resolve('./test/files/test.docx'), 'test.docx')
        .then((result) => {
          chai.expect(result).to.have.status(200);
          db.estimatePineconeDocCount()
              .then((count) => {
                count.should.greaterThan(initialPineconeCount);
              });
          db.estimateSQLDocCount()
              .then((count) => {
                count.should.greaterThan(initialSQLDocCount);
              });

          db.deleteAll('testing');

          done();
        })
        .catch((err) => {
          done(err);
        });
  });

  it('Should upload powerpoint document to pineconce and postgresql', (done) => {
    const initialPineconeCount = db.estimatePineconeDocCount();
    const initialSQLDocCount = db.estimateSQLDocCount();
    agent.post('/upload/ppt')
        .set('content-type', 'application/x-www-form-urlencoded')
        .field('namespace', 'testing')
        .attach('doc', path.resolve('./test/files/test.pptx'), 'test.pptx')
        .then((result) => {
          chai.expect(result).to.have.status(200);
          db.estimatePineconeDocCount()
              .then((count) => {
                count.should.greaterThan(initialPineconeCount);
              });
          db.estimateSQLDocCount()
              .then((count) => {
                count.should.greaterThan(initialSQLDocCount);
              });

          db.deleteAll('testing');

          done();
        })
        .catch((err) => {
          done(err);
        });
  });

  it('Should upload excel document to pineconce and postgresql', (done) => {
    const initialPineconeCount = db.estimatePineconeDocCount();
    const initialSQLDocCount = db.estimateSQLDocCount();
    agent.post('/upload/excel')
        .set('content-type', 'application/x-www-form-urlencoded')
        .field('namespace', 'testing')
        .attach('doc', path.resolve('./test/files/test.xlsx'), 'test.xlsx')
        .then((result) => {
          chai.expect(result).to.have.status(200);
          db.estimatePineconeDocCount()
              .then((count) => {
                count.should.greaterThan(initialPineconeCount);
              });
          db.estimateSQLDocCount()
              .then((count) => {
                count.should.greaterThan(initialSQLDocCount);
              });

          db.deleteAll('testing');

          done();
        })
        .catch((err) => {
          done(err);
        });
  });
});
