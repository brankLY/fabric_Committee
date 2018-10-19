const {
	PROPOSAL_PREFIX, EARTH_MODEL_TOKEN,
} = require('../utils/Constants');
const logger = require('../utils/Logger').getLogger('Token');
const BaseModel = require('./BaseModel');
const SchemaCheker = require('../utils/SchemaChecker');
const getTimeStamp = require('../utils/TimeStamp');
/**
 * Vote is used for member to make a choice with a proposal.
 */
class Vote extends BaseModel {
	constructor(stub) {
		super(stub);
		this.prefix = PROPOSAL_PREFIX;
		this.model = EARTH_MODEL_TOKEN;
	}

	async doCreate(options) {
		const txId = this.stub.getTxID();
		this.buildKey(options.accountId);
		Object.assign(this, options);
		this.timestamp = getTimeStamp(this.stub);
		logger.info('Create  Record for vote:%s', txId);
	}

	async validateOptions(method, options) {
		switch (method) {
		case 'create':
			this.checkCreateOptions(options);
			break;
		default:
		}
	}

	// eslint-disable-next-line no-unused-vars
	async checkPermission(method, options) {
		switch (method) {
		case 'create':
			break;
		default:
			break;
		}
	}

	static checkCreateOptions(options) {
		const fields = [
			{ name: 'accountId', type: 'string', required: true },
			{ name: 'proposalId', type: 'string', required: true },
			{ name: 'choice', type: 'string', required: true },
		];

		SchemaCheker.check(fields, options);
	}

	toJSON() {
		return {
			txId: this.stub.getTxID(),
			accountId: this.accountId,
			proposalId: this.proposalId,
			choice: this.choice,
			timestamp: this.timestamp,
		};
	}
}

module.exports = Vote;
