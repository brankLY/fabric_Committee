const Proposal = require('../model/Proposal');
const Response = require('../utils/Response');
const logger = require('../utils/Logger').getLogger('ProposalHandler');
const Member = require('../model/Member');
const IdentityService = require('../acl/IdentityService');
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
			const member = new Member(stub);
			const exists = await member.exists(createProposalRequest.target);
			logger.debug(' - Member %s exists is %s', createProposalRequest.target, exists);
			if (!exists) {
				logger.error(' - Member %s not exists', createProposalRequest.target);
				throw new Error('Member '+createProposalRequest.target+' not exists');
			}
			const identityService = new IdentityService(stub);
			const id = identityService.getName();
			logger.debug(' - Memberis: %s', id);
			const valid = member.GetValidity(stub, id);
			logger.debug(' - Member %s`s validity is: %s', method, member.validity);
			if (!member.validity) {
				logger.error(' - Member %s not valid', createProposalRequest.target);
				throw new Error('Member '+createProposalRequest.target+' not valid');
			}
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
