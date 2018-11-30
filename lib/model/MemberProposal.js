const util = require('util');
const {
	MEMPROPOSAL_PREFIX, EARTH_MODEL_TOKEN, EARTH_CHAINCODE_ID, GZH_COMMITTEE_CHAINCODE_ID,
} = require('../utils/Constants');
const logger = require('../utils/Logger').getLogger('MemberProposal');
const BaseModel = require('./BaseModel');
const Member = require('./Member');
const getTimeStamp = require('../utils/TimeStamp');
const IdentityService = require('../acl/IdentityService');
const Vote = require('./Vote');
const SchemaCheker = require('../utils/SchemaChecker');
const math = require('mathjs');

/**
 * @typedef {Object} CreateProposalOption
 * @property {string} id - Required. The id of the Proposal.
 * @property {string} target - Required. The beneficiary of the Proposal.
 */


class MemberProposal extends BaseModel {
	constructor(stub) {
		super(stub);
		this.prefix = MEMPROPOSAL_PREFIX;
		this.model = EARTH_MODEL_TOKEN;
		this.buildKey(this.getCN());
		logger.debug('getCN() by :%s', this.key);
	}

	/**
   * create new Proposal
   * @param {CreateProposalOption} options
   * status 0 represent proposal in voting step
   * status 1 represent proposal end with executed
   * status 2 represent proposal end with fail
   */
	async doCreate(options) {
		this.id = options.id;
		this.executed = false;
		this.proposalPassed = false;
		this.numberOfVotes = 0;
		this.currentResult = 0;
		this.votes = {};
		this.status = 0;
		this.member = options.member;
		this.type = options.type;
		this.description = options.description;
		this.deadline = options.deadline;
		this.timestamp = getTimeStamp(this.stub);
		this.buildKey(this.id);
		logger.debug('buildKey by :%s', this.key);
	}

	async doVote(tx) {
		const method = 'doVote';
		try {
			logger.enter(method);
			await this.checkPermission('update', tx);
			await this.checkVoteOptions(tx);
			logger.debug('update proposal by tx:%j', tx);
			const timestamp = this.stub.getTxTimestamp();

			const targetProposal = await this.getOne(tx.proposalId);
			const member = new Member(this.stub);
			// step1 check tx and proposal
			if (!targetProposal) {
				throw new Error('Do not have this proposal');
			}
			const identityService = new IdentityService(this.stub);
			const id = identityService.getName();
			logger.debug(' - Member %s exists is %s', id, exists);
			const exists = await member.exists(id);
			logger.debug(' - Member %s exists is %s', tx.accountId, exists);
			if (!exists) {
				logger.error(' - Member %s not exists', tx.accountId);
				throw new Error('Member  not exists');
			}
			const valid = await member.getValidity(this.stub);
			logger.debug(' - Member %s`s validity is: %s', method, valid);
			if (!valid) {
				logger.error(' - Member %s not valid', tx.accountId);
				throw new Error('Member not valid');
			}
			// if (tx.accountId in targetProposal.votes) {
			// 	throw new Error('You have already voted.');
			// }

			// step2 check status
			if ((targetProposal.status === 1) || (targetProposal.status === 2)) {
				throw new Error('targetProposal already in executing or end step.');
			}
			const checkTime = this.checkTime(targetProposal);
			if (!checkTime) {
				targetProposal.status = 2;
				await this.stub.putState(this.key, Buffer.from(JSON.stringify(targetProposal)));
				throw new Error('targetProposal already end.');
			}

			// step3 do vote
			targetProposal.votes[tx.accountId] = tx.choice;
			logger.debug('targetProposal votes:%j', targetProposal.votes);

			if ((tx.choice === 'y') || (tx.choice === 'Y')) {
				targetProposal.currentResult = math.add(math.bignumber(targetProposal.currentResult), math.bignumber(1)).toNumber();
			}
			targetProposal.numberOfVotes = math.add(math.bignumber(targetProposal.numberOfVotes), math.bignumber(1)).toNumber();
			logger.debug('%s - update targetProposal %s', method, tx.accountId);
			logger.debug('%s - targetProposal.numberOfVotes %s', method, targetProposal.numberOfVotes);
			logger.debug('%s - targetProposal.currentResult %s', method, targetProposal.currentResult);
			await this.stub.putState(this.key, Buffer.from(JSON.stringify(targetProposal)));
			// step4 check if is valid to excude
			if (targetProposal.currentResult >= math.divide(10,3)){
				if (targetProposal.type === 'create') {
					await this.executeProposalCreate(targetProposal);
				}
				else if (targetProposal.type === 'remove') {
					await this.executeProposalRemove(targetProposal);
				}
			}
			/**
   			 create a record vote histort by accountID for user query
   			 */
			const vote = new Vote(this.stub);
			await vote.create({
				accountId: tx.accountId,
				proposalId: tx.proposalId,
				choice: tx.choice,
			});
			logger.exit(method);
			return targetProposal;
		} catch (e) {
			logger.error('%s - Error: %s', method, e.message);
			throw e;
		}
	}

	async executeProposalCreate(option) {
		const method = 'executeProposalCreate';
		try{
			logger.enter(method);
			logger.debug('update proposal by option:%j', option);

			const targetProposal = option;

			// step1 check tx and proposal
			if (!targetProposal) {
				throw new Error('Do not have this proposal');
			}

			// step2 check status
			if ((targetProposal.status === 1) || (targetProposal.status === 2)) {
				throw new Error('targetProposal already end.');
			}

			const request = {
				id: targetProposal.member,
				type:targetProposal.type,
			};
			logger.debug('request is:%j', request);
			const member = new Member(this.stub);
			await member.changeMember(this.stub, request);
			let members = [];
			members = (await this.stub.getState('members')).toString('utf8');
			members = JSON.parse(members);
			logger.debug('record members are %j',members);
			members.push(member.id);
			await this.stub.putState('members', Buffer.from(JSON.stringify(members)));
			targetProposal.status = 1;
			targetProposal.executed = true;
			targetProposal.proposalPassed = true;
			await this.stub.putState(this.key, Buffer.from(JSON.stringify(targetProposal)));
		} catch (e) {
			logger.error('%s - Error: %s', method, e.message);
			throw e;
		}
	}

	async executeProposalRemove(option) {
		const method = 'executeProposalRemove';
		try{
			logger.enter(method);
			logger.debug('update proposal by option:%j', option);

			const targetProposal = option;

			// step1 check tx and proposal
			if (!targetProposal) {
				throw new Error('Do not have this proposal');
			}

			// step2 check status
			if ((targetProposal.status === 1) || (targetProposal.status === 2)) {
				throw new Error('targetProposal already end.');
			}

			const request = {
				id: targetProposal.member,
				type:targetProposal.type,
			};
			logger.debug('request is:%j', request);
			const member = new Member(this.stub);
			await member.changeMember(this.stub, request);
			targetProposal.status = 1;
			targetProposal.executed = true;
			targetProposal.proposalPassed = true;
			await this.stub.putState(this.key, Buffer.from(JSON.stringify(targetProposal)));
		} catch (e) {
			logger.error('%s - Error: %s', method, e.message);
			throw e;
		}
	}

	toJSON() {
		return {
			id: this.id,
			executed: this.executed,
			proposalPassed: this.proposalPassed,
			numberOfVotes: this.numberOfVotes,
			currentResult: this.currentResult,
			votes: this.votes,
			member: this.member,
			type: this.type,
			status: this.status,
			description: this.description,
			timestamp: this.timestamp,
			deadline: this.deadline,
		};
	}

	async checkVoteOptions(options) {
		const fields = [
			{ name: 'proposalId', type: 'string', required: true },
			{ name: 'choice', type: 'string', required: true },
		];

		SchemaCheker.check(fields, options);
	}

	async checkPermission(fcn, options) {
		switch (fcn) {
		case 'create':
			await this.checkCreatePermission(options);
			break;
		case 'update':
			await this.checkUpdatePermission(options);
			break;
		default:
			logger.warn('no \'checkPermission\' implementation found for function %s', fcn);
			// eslint-disable-next-line no-useless-return,consistent-return
			return;
		}
	}

	validateOptions(fcn, options) {
		switch (fcn) {
		case 'create':
			this.checkCreateOptions(options);
			break;
		case 'update':
			this.checkUpdateOptions(options);
			break;
		case 'getOne':
			break;
		default:
			logger.warn('no \'validateOptions\' implementation found for function %s', fcn);
			// eslint-disable-next-line no-useless-return,consistent-return
			return;
		}
	}
	/**
   * Check if the options is a valid {@link CreateTokenOption} object
   *
   * @param {CreateTokenOption} options
   * @throws Error if some check failed.
   */
	async checkCreateOptions(options) {
		const fields = [
			{ name: 'type', type: 'string', required: true },
			{ name: 'member', type: 'string', required: true },
			{ name: 'deadline', type: 'string', required: true },
			{ name: 'description', type: 'string', required: false },
		];

		SchemaCheker.check(fields, options);

	}


	async checkCreatePermission(fcn, options) {
		const method = 'checkCreatePermission';
		logger.enter(method);
		logger.exit(method);
	}

	async checkUpdatePermission(fcn, options) {
		const method = 'checkUpdatePermission';
		logger.enter(method);
		logger.exit(method);
	}

	async checkTime(options) {
		const method = 'checkTime';
		try {
			logger.enter(method);
			const endTime = new Date(options.deadline);
			logger.debug('%s - endTime is  %s %s', method, endTime, typeof(endTime));
			if (endTime.toString() === 'Invalid Date'){
				logger.error('targetProposal`s deadline is illegal');
				throw new Error(util.format('targetProposal`s deadline is illegal'));
			}
			const now = new Date(Date.now());
			logger.debug('%s - endTime is  %s, now is %s', method, endTime, now);
			if (endTime <= now) {
				logger.error('targetProposal already end');
				throw new Error(util.format('targetProposal already end'));
			}
			logger.exit(method);
			return true;
		} catch (e) {
			logger.error('%s - Error: %o', method, e);
			return false;
		}
	}

	async getOne(id) {
		const method = 'getOne';
		try {
			logger.enter(method);
			logger.debug(' %s- targetProposal id is %s', method, id);
			const key = await this.buildKey(id);
			logger.debug(' %s- this.key is %s', method, key);
			let model = (await this.stub.getState(this.key)).toString('utf8');
			logger.debug(' %s- this model is %j', method, model);
			model = JSON.parse(model);
			logger.debug(' %s- this model is %j', method, model);
			logger.exit(method);
			return this.fromJSON(model);
		} catch (e) {
			logger.error('%s - Error: %o', method, e);
			throw e;
		}
	}


}

module.exports = MemberProposal;
