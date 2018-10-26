/* eslint-disable no-new */
const Member = require('../../lib/model/Member');
const chai = require('chai');
const chaiPromised = require('chai-as-promised');
const MockStub = require('../mock-stub');
const sinon = require('sinon');
const ChaincodeStub = require('./stub');
const Context = require('./context');
const Runtime = require('../pouchdb-runtime/runtime-pouchdb');


const stub = new ChaincodeStub();

chai.use(chaiPromised);
const should = chai.should();

describe('Unit Test For Member', () => {
  const newstub = new MockStub();
  let runtime;
  runtime = new Runtime();
  
  const cert = '-----BEGIN CERTIFICATE-----\n' +
    'MIICwDCCAmagAwIBAgIUMdfKxK9vzQMDyfn6wtOJunKqtMMwCgYIKoZIzj0EAwIw\n' +
    'czELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\n' +
    'biBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\n' +
    'E2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMTgwNjE3MDM1MjAwWhcNMTkwNjE3MDM1\n' +
    'NzAwWjBaMSkwDQYDVQQLEwZjbGllbnQwCwYDVQQLEwRvcmcxMAsGA1UECxMEdXNl\n' +
    'cjEtMCsGA1UEAxMkOWVjNzM2MDQtMDIyNS00ZDk5LTgzZDctYjg1OGI0OTllNjM5\n' +
    'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEE+t8qJ2Qjy77iFUl2gE1OSuZ9QOI\n' +
    'AserxOui7FEeeqTJarokt0fDxEeIbdbFQdZbhN8AVHwrtNi4MPuHlRrRCaOB8DCB\n' +
    '7TAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQU9BGghcE0\n' +
    'm2PTpmT9MYDr2BL1jLAwKwYDVR0jBCQwIoAgllQHfJm2YorpFTfWi4KWa0D2MgN5\n' +
    'y8FPH9iCpNq8lZQwgYAGCCoDBAUGBwgBBHR7ImF0dHJzIjp7ImhmLkFmZmlsaWF0\n' +
    'aW9uIjoib3JnMS51c2VyIiwiaGYuRW5yb2xsbWVudElEIjoiOWVjNzM2MDQtMDIy\n' +
    'NS00ZDk5LTgzZDctYjg1OGI0OTllNjM5IiwiaGYuVHlwZSI6ImNsaWVudCJ9fTAK\n' +
    'BggqhkjOPQQDAgNIADBFAiEAwGbq0Z7wqTQm/vG2TU4y1IniWHhoitqLzW81+IOH\n' +
    'd+ACIACp77nySZ2j8JrY5MEDXrTd3ua+hOdAoAwARDp6e2ug\n' +
    '-----END CERTIFICATE-----\n';

  describe('Test Member', () => {
    it('Member without stub should throw error', () => {
      should.throw(() => {
        new Member();
      }, /Missing Required Argument stub/);
    });

    it('construct with stub should success', () => {
      should.not.throw(() => {
        new Member(stub);
      });
    });
  });
  
  describe('Test create()', () => {
    it('Call create should return the serialized model', async () => {
      const ctx = new Context(runtime.db);
      runtime.stub.setCtx(ctx);
      let member = new Member(runtime.stub);
      req = {
        id:'abcdefg',
      }
      const res = await member.create(req);
      res.should.eql(true);
    });
  });
  // describe('Test GetValidity()', () => {
  //   it('Call GetValidity should return the serialized model', () => {
  //     let member = new Member(stub);
  //     member = member.GetValidity(stub);
  //     const res = member;
  //     res.should.eql(true);
  //   });
  // });

});
