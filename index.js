/* eslint-disable class-methods-use-this */
const shim = require('fabric-shim');

const logger = require('./lib/utils/Logger').getLogger('GZHCOMMITTEE:index.js');
const Response = require('./lib/utils/Response');

const CommitteeHandler = require('./lib/handler/CommitteeHandler');
const MemberHandler = require('./lib/handler/MemberHandler');
const ProposalHandler = require('./lib/handler/ProposalHandler');

class Chaincode {
  async Init(stub) {
    logger.debug('############## Init Start ##############');
    const method = 'init';
    logger.enter(method);
    const { params } = stub.getFunctionAndParameters();
    logger.debug('%s - call Init with params %j', method, params);
    try {
      if (params[0] === 'upgrade') {
        logger.info('Successfully upgrade chaincode');
        return Response(true, 'Success Updated');
      }
      logger.debug('Successfully Init');
      logger.exit(method);
      return Response(true, 'Success Init'));
    } catch (e) {
      return Response(false, e.message);
    }
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
  }
}

shim.start(new Chaincode());
