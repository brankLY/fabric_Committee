const Proposal = require('../model/Proposal');
const Response = require('../utils/Response');
const logger = require('../utils/Logger').getLogger('ProposalHandler');
// const Constants = require('../utils/Constants');
// const SchemaCheker = require('../utils/SchemaChecker');
// const util = require('util');


class ProposalHandler {
	/**
   *
   * @param stub
   * @param params [to, name, amount]
   * @return {Promise<*>}
   */
	static async Create(stub, params) {
		const method = 'Create';
		try {
			logger.enter(method);
			logger.debug('%s - params: %j', method, params);
			if (params.length !== 1) {
				logger.error('%s - Create new User requires params of length 1, found %s, %j', method, params.length, params);
				return Response(false, 'Create new User requires params of length 1');
			}

			const createProposalRequest = JSON.parse(params[0]);
			const proposal = new Proposal(stub);
			await proposal.create(createProposalRequest);
			logger.debug('%s - Successfully created new Proposal in bc, response: %s', method, proposal.toString());
			return Response(true, proposal.toString());
		} catch (e) {
			logger.error('%s - Error: %s', method, e);
			return Response(false, e.message);
		}
	}

	/**
   *
   * @param stub
   * @param params [targetProposalId, memberId, choice]
   * @return {Promise<*>}
   */
	static async Vote(stub, params) {
		const method = 'Vote';
		try {
			logger.enter(method);
			logger.debug('%s - params: %j', method, params);
			if (params.length !== 1) {
				logger.error('%s - Vote requires params of length 1, found %s, %j', method, params.length, params);
				return Response(false, 'Vote requires params of length 1');
			}
			logger.debug('%s - Member %s vote', method, params[0]);
			const createVoteRequest = JSON.parse(params[0]);
			const proposal = new Proposal(stub);
			await proposal.doVote(createVoteRequest);
			logger.debug('%s - Successfully Vote in bc, response: %s', method, proposal.toString());
			logger.exit(method);
			return Response(true, proposal.toString());
		} catch (e) {
			logger.error('%s - Error: %s', method, e);
			return Response(false, e.message);
		}
	}
}

module.exports = ProposalHandler;
