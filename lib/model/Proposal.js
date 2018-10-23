const util = require('util');
const {
	PROPOSAL_PREFIX, EARTH_MODEL_TOKEN, EARTH_CHAINCODE_ID, GZH_COMMITTEE_CHAINCODE_ID,
} = require('../utils/Constants');
const logger = require('../utils/Logger').getLogger('Proposal');
const BaseModel = require('./BaseModel');
const Member = require('./Member');
const getTimeStamp = require('../utils/TimeStamp');
const Vote = require('./Vote');
const SchemaCheker = require('../utils/SchemaChecker');
const math = require('mathjs');
const uuid = require('uuid');

/**
 * @typedef {Object} CreateProposalOption
 * @property {string} id - Required. The id of the Proposal.
 * @property {string} target - Required. The beneficiary of the Proposal.
 */


class Proposal extends BaseModel {
	constructor(stub) {
		super(stub);
		this.prefix = PROPOSAL_PREFIX;
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
		this.id = await uuid.v1();
		this.beneficiary = options.target;
		this.executed = false;
		this.proposalPassed = false;
		this.numberOfVotes = 0;
		this.currentResult = 0;
		this.votes = [];
		// this.voted = [];
		this.amount = options.amount;
		this.status = 0;
		this.description = options.description;
		this.deadline = options.deadline;
		this.timestamp = getTimeStamp(this.stub);
		this.buildKey(this.id);
		logger.debug('buildKey by :%s', this.key);
	}

	async doVote(tx, targetProposal) {
		const method = 'doVote';
		try {
			logger.enter(method);
			await this.checkPermission('update', tx);
			await this.checkVoteOptions(tx);
			logger.debug('update proposal by tx:%j', tx);
			const timestamp = this.stub.getTxTimestamp();

			// step1 check tx and proposal
			if (!targetProposal) {
				throw new Error('Do not have this proposal');
			}
			if (!Member.exists(tx.accountId)){
				throw new Error('member not exists');
			}
			const member = Member.getOne(tx.accountId);
			if (!member.validity) {
				throw new Error('You are not a valid member.');
			}
			if (tx.accountId in targetProposal.votes) {
				throw new Error('You have already voted.');
			}

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
			if ((tx.choice === 'y') || (tx.choice === 'Y')) {
				targetProposal.currentResult = math.add(math.bignumber(targetProposal.currentResult), math.bignumber(1)).toNumber();
			}
			targetProposal.numberOfVotes = math.add(math.bignumber(targetProposal.numberOfVotes), math.bignumber(1)).toNumber();
			logger.debug('%s - update targetProposal %s', method, tx.accountId);

			// step4 check if is valid to excude
			if (targetProposal.currentResult >= math.divide(5,3)){
				targetProposal.status = 1;
				this.executeProposal(tx);
			}
			await this.stub.putState(this.key, Buffer.from(JSON.stringify(targetProposal)));
			/**
    create a record vote histort by accountID for user query
    */
			const vote = new Vote(this.stub);
			await vote.create({
				accountId: this.accountId,
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

	async executeProposal(option) {
		const method = 'endProposal';
		try{
			logger.enter(method);
			logger.debug('update proposal by option:%j', option);
			this.buildKey(option.proposalId);

			const targetProposal = await this.getOne();

			// step1 check tx and proposal
			if (!targetProposal) {
				throw new Error('Do not have this proposal');
			}

			// step2 check status
			if ((targetProposal.status === 1) || (targetProposal.status === 2)) {
				throw new Error('targetProposal already end.');
			}

			const request = {
				symbol: 'GZH',
				from: GZH_COMMITTEE_CHAINCODE_ID,
				target: option.target,
				amount: option.amount,
				description: 'CommitteeProposal transfer',
			};
			await this.stub.invokeChaincode(EARTH_CHAINCODE_ID, ['wallet.transfer', JSON.stringify(request)]);
			targetProposal.status = 1;
			await this.stub.putState(this.key, Buffer.from(JSON.stringify(targetProposal)));
		} catch (e) {
			logger.error('%s - Error: %s', method, e.message);
			throw e;
		}
	}

	toJSON() {
		return {
			id: this.id,
			beneficiary: this.beneficiary,
			executed: this.executed,
			proposalPassed: this.proposalPassed,
			numberOfVotes: this.numberOfVotes,
			currentResult: this.currentResult,
			votes: this.votes,
			target: this.target,
			amount: this.amount,
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

	/**
   * For a Token, we need to check that the name and symbol are both unique
   * if name or symbol already exists for some token, return false
   * otherwise return true
   * @param name
   * @param symbol
   */
	// async exists(name, id) {
	// 	const method = 'exists';
	// 	logger.enter(method);

	// 	const selector = {
	// 		model: EARTH_MODEL_TOKEN,
	// 		$or: [
	// 			{ name },
	// 			{ symbol },
	// 		],
	// 	};

	// 	const query = { selector };

	// 	const queryResults = await this.stub.getQueryResult(JSON.stringify(query));
	// 	logger.debug(queryResults);
	// 	return queryResults.length !== 0;
	// }

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
			{ name: 'target', type: 'string', required: true },
			{ name: 'amount', type: 'uint4', required: true },
			{ name: 'deadline', type: 'string', required: true },
		];

		SchemaCheker.check(fields, options);
	}


	// async setDeadLine(option) {
	// 	const ts = this.stub.getTxTimestamp();
	// 	const stepTime = 86400000;
	// 	let timestamp = ts.seconds.toInt();
	// 	const nanos = ts.nanos / 1000000;
	// 	// eslint-disable-next-line no-mixed-operators
	// 	timestamp = 86400000 * option + timestamp;
	// 	timestamp = timestamp * 1000 + nanos;
	// 	return new Date(timestamp);
	// }

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
			const endTime = new Date(options.endTime);
			const now = new Date(Date.now());
			logger.debug('%s - endTime is  %s, now is %s', method, endTime, now);
			if (endTime <= now) {
				logger.error('FutureBureau %s already end', options.name);
				throw new Error(util.format('FutureBureau %s already end', options.name));
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

module.exports = Proposal;
