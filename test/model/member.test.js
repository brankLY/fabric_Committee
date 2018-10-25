/* eslint-disable no-unused-expressions */
const Stub = require('../mock-stub');
const { expect } = require('chai');
const Runtime = require('../pouchdb-runtime/runtime-pouchdb');

const stub = new Stub();

const Member = require('../../lib/model/Member');

describe('Test Member', () => {
  let runtime;
  const target = {
    id: '9ec73604-0225-4d99-83d7-b858b499e639',
    name: 'user0',
    role: 'user',
  };
  // cert for target user {{{
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
  // }}}

  before(async () => {
    await stub.reset();
    runtime = new Runtime();
  });

  after(async () => {
    await runtime.stop();
  });
  // Constructor Test {{{
  it('Constructor Test', () => {
    try {
      // eslint-disable-next-line no-new
      new Member(stub);
    } catch (e) {
      expect(e.message).to.equal('Missing Required Argument stub');
    }
  });
  // }}}

  // Create new User without correct CreateUserOption should throw error {{{
  // it('Create new User without correct CreateUserOption should throw error', async () => {
  //   stub.setUserCtx(cert);
  //   try {
  //     const member = new Member(stub);
  //     await member.create(stub);
  //     throw new Error('Test Failed');
  //   } catch (e) {
  //     expect(e.message).to.equal('Missing Required param options or options is not a valid object');
  //   }

  //   try {
  //     const member = new Member(stub);
  //     await member.create(stub, 'dummy');
  //     throw new Error('Test Failed');
  //   } catch (e) {
  //     expect(e.message).to.equal('Missing Required param options or options is not a valid object');
  //   }

  //   try {
  //     const member = new Member(stub);
  //     await member.create(stub, {});
  //     throw new Error('Test Failed');
  //   } catch (e) {
  //     expect(e.message).to.equal('{} is not a valid CreateUserOption Object, Missing Required property id');
  //   }

  //   try {
  //     const member = new Member(stub);
  //     await member.create(stub, { id: 123 });
  //     throw new Error('Test Failed');
  //   } catch (e) {
  //     expect(e.message).to.equal('123 is not a valid string for CreateUserOption.id');
  //   }
  // });
  // }}}

  // Create new User with CreateUserOption should success {{{
  // it('Create new User with CreateUserOption should success', async () => {
  //   runtime.stub.setUserCtx(cert);
  //   const opts = {
  //     id: 'zhangsan',
  //   };
  //   let member = new Member(stub);
  //   member = await member.create(opts);

  //   expect(member).exist;
  //   expect(member.id).to.equal(opts.id);
  //   expect(member.validity).to.equal(true);
  // });
  // }}}

  // // Create new User with a wrong id should throw error {{{
  // it('Create new User with a wrong id should throw error', async () => {
  //   try {
  //     const opts = {
  //       id: 'user0',
  //       name: 'zhangsan',
  //       role: 'user',
  //     };
  //     await User.Create(stub, opts);
  //     expect.fail();
  //   } catch (e) {
  //     expect(e.message).to.equal('Identity admin do not have permission to create new User user0');
  //   }
  // });
  // // }}}

  // Test exists {{{
  it('Test exists', async () => {
    let member = new Member(stub);
    let res = await member.exists('admin');
    expect(res).to.equal(false);
  });
  // }}}
  // }}}
});
