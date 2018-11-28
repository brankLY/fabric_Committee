const TXProposal = require('../model/TXProposal');
const MemberProposal = require('../model/MemberProposal');
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
	static async CreateTx(stub, params) {
		const method = 'CreateTx';
		try {
			logger.enter(method);
			if (!params) {
   				logger.error('%s - Create new TX Proposal params of length 1, found %s, %j', method, params);
  				throw new Error('Create new Proposal requires params of length 1');
 		    }
			logger.debug('%s - params: %j', method, params);
			if (params.length !== 1) {
				logger.error('%s - Create new TX Proposal params of length 1, found %s, %j', method, params.length, params);
				return Response(false, 'Create new Proposal requires params of length 1');
			}

			const createProposalRequest = JSON.parse(params[0]);
			let proposals = [];
			proposals = (await stub.getState('txProposals')).toString('utf8');
			if (proposals){
				logger.debug(' - proposals are: %j', proposals);
				proposals = JSON.parse(proposals);
			}else{
				logger.debug(' - none proposals');
				proposals = [];
			}
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
			const proposal = new TXProposal(stub);
			logger.debug('%s - txProposals is %j', method, createProposalRequest);
			await proposal.create(createProposalRequest);
			await proposals.push(proposal.id);
			await stub.putState('txProposals', Buffer.from(JSON.stringify(proposals)));
			logger.debug('%s - proposal key is %j', method, proposal.key);
			logger.debug('%s - proposals are %j', method, proposals);
			logger.debug('%s - Successfully created new Proposal in bc, response: %s', method, proposal.toString());
			return Response(true, proposal.toString());
		} catch (e) {
			logger.error('%s - Error: %s', method, e);
			return Response(false, e.message);
		}
	}


	static async CreateMem(stub, params) {
		const method = 'CreateMem';
		try {
			logger.enter(method);
			if (!params) {
   				logger.error('%s - Create new member Proposal params of length 1, found %s, %j', method, params);
  				throw new Error('Create new Proposal requires params of length 1');
 		    }
			logger.debug('%s - params: %j', method, params);
			if (params.length !== 1) {
				logger.error('%s - Create new member Proposal params of length 1, found %s, %j', method, params.length, params);
				return Response(false, 'Create new Proposal requires params of length 1');
			}

			const createProposalRequest = JSON.parse(params[0]);

			const member = new Member(stub);
			const exists = await member.exists(createProposalRequest.member);
			if (exists & (createProposalRequest.type === 'create')) {
				logger.error(' - Member %s already exists do not need create', createProposalRequest.member);
				throw new Error('Member '+createProposalRequest.member+' already exists');
			}
			if (!exists & (createProposalRequest.type === 'remove')) {
				logger.error(' - Member %s not exists do not need remove', createProposalRequest.member);
				throw new Error('Member '+createProposalRequest.member+' not exists');
			}


			let memberProposals = [];
			memberProposals = (await stub.getState('memberProposals')).toString('utf8');
			if (memberProposals){
				logger.debug(' - memberProposals are: %j', memberProposals);
				memberProposals = JSON.parse(memberProposals);
			}else{
				logger.debug(' - none memberProposals');
				memberProposals = [];
			}
			const identityService = new IdentityService(stub);
			const id = identityService.getName();
			logger.debug(' - user is: %s', id);
			const proposal = new MemberProposal(stub);
			logger.debug('%s - Member proposal is %j', method, createProposalRequest);

			const timeout = !await proposal.checkTime(createProposalRequest);
			logger.debug(' - timeout is: %j', timeout);

			await proposal.create(createProposalRequest);
			await memberProposals.push(proposal.id);
			await stub.putState('memberProposals', Buffer.from(JSON.stringify(memberProposals)));
			logger.debug('%s - proposal key is %j', method, proposal.key);
			logger.debug('%s - memberProposals are %j', method, memberProposals);
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
	static async VoteTx(stub, params) {
		const method = 'VoteTx';
		try {
			logger.enter(method);
			logger.debug('%s - params: %j', method, params);
			if (params.length !== 1) {
				logger.error('%s - Vote requires params of length 1, found %s, %j', method, params.length, params);
				return Response(false, 'Vote requires params of length 1');
			}
			const createVoteRequest = JSON.parse(params[0]);
			const proposal = new TXProposal(stub);
			await proposal.doVote(createVoteRequest);
			logger.debug('%s - Successfully Vote in bc, response: %s', method, proposal.toString());
			logger.exit(method);
			return Response(true, proposal.toString());
		} catch (e) {
			logger.error('%s - Error: %s', method, e);
			return Response(false, e.message);
		}
	}

	static async VoteMem(stub, params) {
		const method = 'VoteMem';
		try {
			logger.enter(method);
			logger.debug('%s - params: %j', method, params);
			if (params.length !== 1) {
				logger.error('%s - Vote requires params of length 1, found %s, %j', method, params.length, params);
				return Response(false, 'Vote requires params of length 1');
			}
			const createVoteRequest = JSON.parse(params[0]);
			const proposal = new MemberProposal(stub);
			await proposal.doVote(createVoteRequest);
			logger.debug('%s - Successfully Vote in bc, response: %s', method, proposal.toString());
			logger.exit(method);
			return Response(true, proposal.toString());
		} catch (e) {
			logger.error('%s - Error: %s', method, e);
			return Response(false, e.message);
		}
	}

	/**
   *
   * @param stub
   * @param params [queryProposalId, type]
   * @return {Promise<*>}
   * type 1 stand for query tx
   * type 2 stand for query mem
   */
	static async Query(stub, params) {
		const method = 'Query';
		try {
			logger.enter(method);
			logger.debug('%s - params: %j', method, params);
			if (params.length !== 1) {
				logger.error('%s - Query requires params of length 1, found %s, %j', method, params.length, params);
				return Response(false, 'Query requires params of length 1');
			}
			let proposal;
			const queryRequest = JSON.parse(params[0]);
			logger.debug('%s - query type: %j', method, queryRequest.type);
			const type = Number(queryRequest.type);
			if (type === 1){
				proposal = new TXProposal(stub);
				proposal = await proposal.getOneTx(queryRequest.proposalId);
			}
			if (type === 2){
				proposal = new MemberProposal(stub);
				proposal = await proposal.getOne(queryRequest.proposalId);
				logger.debug('%s - Successfully Query in bc, response: %s', method, proposal.toString());
			}
			logger.exit(method);
			return Response(true, proposal.toString());
		} catch (e) {
			logger.error('%s - Error: %s', method, e);
			return Response(false, e.message);
		}
	}

	static async GetTxProposals(stub) {
		const method = 'GetTxProposals';
		// TODO: perform complex query to check if futureBureau with this name exists
		logger.enter(method);
		let proposals;
		try {
			proposals = (await stub.getState('txProposals')).toString('utf8');
			logger.debug('%j - record', proposals);
			if (!proposals) {
				logger.error('%s - Can not find proposals ', method);
				throw new Error('proposals does not exist');
			}
			proposals = JSON.parse(proposals);
			logger.debug('record proposals are %s',proposals[0]);
			logger.exit(method);
			return Response(true, proposals);
		} catch (e) {
			logger.error('%s - Failed to test New proposals Info, Error: %j', method, e.message);
			return Response(false, e.message);
		}
	}

	static async GetMemProposals(stub) {
		const method = 'GetMemProposals';
		// TODO: perform complex query to check if futureBureau with this name exists
		logger.enter(method);
		let proposals;
		try {
			proposals = (await stub.getState('memberProposals')).toString('utf8');
			logger.debug('%j - record', proposals);
			if (!proposals) {
				logger.error('%s - Can not find proposals ', method);
				throw new Error('proposals does not exist');
			}
			proposals = JSON.parse(proposals);
			logger.debug('record proposals are %s',proposals[0]);
			logger.exit(method);
			return Response(true, proposals);
		} catch (e) {
			logger.error('%s - Failed to test New proposals Info, Error: %j', method, e.message);
			return Response(false, e.message);
		}
	}

}

module.exports = ProposalHandler;
