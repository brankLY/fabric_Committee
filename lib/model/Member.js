/* eslint-disable class-methods-use-this,no-restricted-syntax */
const BaseModel = require('./BaseModel');
const util = require('util');
const {
	COMMITTEE_MODEL_MEMBER,
	MEMBER_PREFIX,
	EARTH_ACCOUNT_TYPE_ADMIN,
	EARTH_CHAINCODE_ID,
} = require('../utils/Constants');
const SchemaCheker = require('../utils/SchemaChecker');
const IdentityService = require('../acl/IdentityService');
const TypeChecker = require('../utils/TypeChecker');
const logger = require('../utils/Logger').getLogger('Member');

class Member extends BaseModel{
	constructor(stub) {
		super(stub);
		this.prefix = MEMBER_PREFIX;
		this.model = COMMITTEE_MODEL_MEMBER;
		this.buildKey(this.getCN());
	}

	async doCreate(options) {
		this.id = options.id;
		this.validity = true;
		this.buildKey(this.id);
	}


	toJSON() {
		return {
			id: this.id,
			validity: this.validity,
		};
	}


	async exists(id) {
		const method = 'exists';
		logger.enter(method);
		if (!this.stub) {
			throw new Error('Missing Required Argument "stub" in get()');
		}

		const key = this.buildKey(id);
		const res = !!(await this.stub.getState(key)).toString('utf8');
		logger.exit(method);
		return res;
	}

	validateOptions(fcn, options) {
		switch (fcn) {
		case 'create':
			this.checkCreateOptions(options);
			break;
		case 'update':
			this.checkUpdateOptions(options);
			break;
		default:
			logger.warn('no \'validateOptions\' implementation found for function %s', fcn);
			// eslint-disable-next-line no-useless-return,consistent-return
			return;
		}
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

	async changeMember(stub, options) {
		switch (options.type) {
		case 'create':
			await this.create(options);
			break;
		case 'remove':
			await this.removeMember(stub, options.id);
			break;
		default:
			logger.warn('no \'checkPermission\' implementation found for function %s', options.type);
			// eslint-disable-next-line no-useless-return,consistent-return
			return;
		}
	}

	async removeMember(stub, userId) {
		const method = 'removeMember';
		logger.enter(method);
		let id = userId;
		if (!id) {
			const identityService = new IdentityService(stub);
			id = identityService.getName();
		}
		let member = await this.getOne(id);
		logger.debug('%s - get Member %s is %j', method, id, member);
		if (!member) {
			logger.error('%s - Can not find member %s', method, id);
			throw new Error(util.format('member %s does not exist', id));
		}
		member = JSON.parse(member);
		member.validity = false;
		logger.debug('%s - Successfully get member from bc. %j', method, member);
		logger.exit(method);
		return member.save;
	}


	/**
  	 * Verify member`s Validity
  	 * use userId to make sure
  	 */
	async getValidity(stub, userId) {
		const method = 'getValidity';
		logger.enter(method);
		let id = userId;
		if (!id) {
			const identityService = new IdentityService(stub);
			id = identityService.getName();
		}
		let member = await this.getOne(id);
		logger.debug('%s - get Member %s is %j', method, id, member);
		if (!member) {
			logger.error('%s - Can not find member %s', method, id);
			throw new Error(util.format('member %s does not exist', id));
		}
		member = JSON.parse(member);
		logger.debug('%s - Successfully get member from bc. %j', method, member);
		logger.exit(method);
		return member.validity;
	}


	async checkCreatePermission(options) {
		const method = 'checkCreatePermission';
		logger.enter(method);
		let account = await this.stub.invokeChaincode(EARTH_CHAINCODE_ID, ['account.query']);
		account = account.payload.toString('utf8');
		logger.debug('- toString(account) in member %s', account);
		account = JSON.parse(account);
		logger.debug('%j - account is %s', account, account.role);
		logger.debug(' - EARTH_ACCOUNT_TYPE_ADMIN is %s', EARTH_ACCOUNT_TYPE_ADMIN);
		if (account.role !== EARTH_ACCOUNT_TYPE_ADMIN) {
			throw new Error('Current identity do not have permission to create member, need admin');
		}
	}

	async checkCreateOptions(options) {
		const fields = [
			{ name: 'id', type: 'string', required: true },
		];
		SchemaCheker.check(fields, options);
	}

	async checkSaveOptions(options) {
		const fields = [
			{ name: 'id', type: 'string', required: true },
			{ name: 'validity', type: 'bool', required: true },
		];
		SchemaCheker.check(fields, options);
	}

	/**
   * getOne return the obj with this.key
   * return null if this.key not found
   * else set the properties to this, and return this
   * @returns {Promise<*>}
   */
	async getOne(id) {
		const method = 'getOne';
		logger.enter(method);
		if (!this.stub) {
			throw new Error('Missing Required Argument "stub" in getOne()');
		}
		const key = this.buildKey(id);
		await this.validationAndAcl(method, null);
		logger.debug(' %s- this.key is %s', method, key);
		let model = (await this.stub.getState(key)).toString('utf8');
		logger.debug(' %s- model is %s', method, model);
		if (!model) {
			logger.info('%s - Can not find Model %s', method, this.key);
			return null;
		}
		model = JSON.parse(model);
		logger.debug('%s - Successfully get Model from bc. %j', method, model);
		logger.exit(method);
		return this.fromJSON(model);
	}

}

module.exports = Member;
