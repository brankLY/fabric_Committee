/* eslint-disable class-methods-use-this */
const shim = require('fabric-shim');

const logger = require('./lib/utils/Logger').getLogger('GZHCOMMITTEE:index.js');
const Response = require('./lib/utils/Response');

const CommitteeHandler = require('./lib/handler/CommitteeHandler');
const MemberHandler = require('./lib/handler/MemberHandler');
const ProposalHandler = require('./lib/handler/ProposalHandler');

class Chaincode {
  async Init(stub) {
    logger.debug('######## Init ########');
    const {
      fcn,
      params,
    } = stub.getFunctionAndParameters();
    logger.debug('Init with fcn:%s and params:%j', fcn, params);
    return shim.success();
  }

  async Invoke(stub) {
    logger.debug('############## Invoke Start ##############');
    const {
      fcn,
      params,
    } = stub.getFunctionAndParameters();
    logger.debug('Invoke with fcn:%s and params:%j', fcn, params);
    switch (fcn) {
      case 'committee.init':
        logger.debug('6666');
        return CommitteeHandler.Init(stub, params);
      case 'member.init':
        return MemberHandler.Init(stub, params);
      case 'proposal.create':
        return ProposalHandler.Create(stub, params);
      case 'proposal.vote':
        return ProposalHandler.Vote(stub, params);
      default:
        return shim.error(Buffer.from(`${fcn} is not a valid function name`));
    }
    // return shim.success();
  }
}

shim.start(new Chaincode());
