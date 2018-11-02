const MemberHandler = require('../../lib/handler/MemberHandler');
const Runtime = require('../pouchdb-runtime/runtime-pouchdb');
const chai = require('chai');
const chaiPromised = require('chai-as-promised');

const Stub = require('../mock-stub');
const { expect } = require('chai');

const stub = new Stub();

chai.use(chaiPromised);
chai.should();

describe('Test Member', () => {
  let runtime;
  let resp;
  const member = {
    member1: "11111",
    member2: '21111',
    member3: '31111',
    member4: '41111',
    member5: '51111',
  };

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

  before(() => {
    runtime = new Runtime();
  });

  after(async () => {
    await runtime.stop();
  });


describe('Create()', () => {
    const handler = MemberHandler.Init;
    let req;

    it('missing params should response error', async () => {
      const resp = await runtime.invoke(handler);
      resp.status.should.eql(500);
      resp.message.should.eql('init Members requires params');
    });

    it('wrong params length should response error', async () => {
      const resp = await runtime.invoke(handler, ['123', 'zhangsan']);
      resp.status.should.eql(500);
      resp.message.should.eql('Init Committee members required params of length 1');
    });
  });

  describe('GetAll() can return the basic info of members', () => {
    const handler = MemberHandler.GetAll;

    it('GetAll without members should response error', async () => {
      runtime.stub.setUserCtx(cert);
      const resp = await runtime.invoke(handler, []);
      resp.status.should.eql(500);
    });
    it('GetAll Members requires params 0', async () => {
      const resp = await runtime.invoke(handler, ['123', 'zhangsan']);
      resp.status.should.eql(500);
      resp.message.should.eql('GetAll Members requires params 0');
    });
  });

});