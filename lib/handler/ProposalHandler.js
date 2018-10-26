const Proposal = require('../model/Proposal');
const Response = require('../utils/Response');
const logger = require('../utils/Logger').getLogger('ProposalHandler');
const Member = require('../model/Member');
const IdentityService = require('../acl/IdentityService');


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
			let proposals = [];
			proposals = (await stub.getState('proposals')).toString('utf8');
			logger.debug('%s - proposals are %j before', method, proposals);
			proposals =  JSON.parse(proposals);
			//const member = new Member(stub);
			// const exists = await member.exists(createProposalRequest.target);
			// logger.debug(' - Member %s exists is %s', createProposalRequest.target, exists);
			// if (!exists) {
			// 	logger.error(' - Member %s not exists', createProposalRequest.target);
			// 	throw new Error('Member '+createProposalRequest.target+' not exists');
			// }
			const identityService = new IdentityService(stub);
			const id = identityService.getName();
			logger.debug(' - user is: %s', id);
			// const valid = await member.GetValidity(stub);
			// logger.debug(' - Member %s`s validity is: %s', method, member.validity);
			// if (!valid) {
			// 	logger.error(' - Member %s not valid', createProposalRequest.target);
			// 	throw new Error('Member '+createProposalRequest.target+' not valid');
			// }
			const proposal = new Proposal(stub);
			logger.debug('%s - Member proposal is %j', method, createProposalRequest);
			await proposal.create(createProposalRequest);
			proposals.push(proposal.id);
			await stub.putState('proposals', Buffer.from(JSON.stringify(proposals)));
			logger.debug('%s - proposal key is %j', method, proposal.key);
			logger.debug('%s - proposals are %j', method, proposals);
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

	static async Query(stub, params) {
		const method = 'Query';
		try {
			logger.enter(method);
			logger.debug('%s - params: %j', method, params);
			if (params.length !== 1) {
				logger.error('%s - Query requires params of length 1, found %s, %j', method, params.length, params);
				return Response(false, 'Query requires params of length 1');
			}
			const queryRequest = JSON.parse(params[0]);
			let proposal = new Proposal(stub);
			proposal = await proposal.getOne(queryRequest.proposalId);
			logger.debug('%s - Successfully Query in bc, response: %s', method, proposal.toString());
			logger.exit(method);
			return Response(true, proposal.toString());
		} catch (e) {
			logger.error('%s - Error: %s', method, e);
			return Response(false, e.message);
		}
	}

	static async GetAll(stub) {
		const method = 'GetAll';
		// TODO: perform complex query to check if futureBureau with this name exists
		logger.enter(method);
		let proposals;
		try {
			proposals = (await stub.getState('proposals')).toString('utf8');
			logger.debug('%s - record', proposals);
			if (!proposals) {
				logger.error('%s - Can not find proposals ', method);
				throw new Error('proposals does not exist');
			}
			proposals = JSON.parse(proposals);
			// for(const num in record){
			// 	const createOption = {
			// 		id:req[num],
			// 	};
			// 	const member1 = id;
			logger.debug('record proposals are %j , id is %s',proposals[0], proposals[0].id);
			logger.exit(method);
			return Response(true, proposals);
		} catch (e) {
			logger.error('%s - Failed to test New proposals Info, Error: %j', method, e.message);
			return Response(false, e.message);
		}
	}

}

module.exports = ProposalHandler;
