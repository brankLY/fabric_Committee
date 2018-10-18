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
		this.validity = options.validity;
		this.buildKey(this.id);
	}

	// async save() {
	// 	const method = 'save';
	// 	try {
	// 		logger.enter(method);
	// 		this.CHECK_SAVE_OPTIONS(this);
	// 		logger.debug('Pass Save Options Check');
	// 		logger.debug('%s - Result user Check in save %j', method, this);
	// 		const key = this.BUILD_MEMBER_KEY(this.stub, this.id);
	// 		await this.stub.putState(key, this.toBuffer());
	// 		logger.exit(method);
	// 		return this;
	// 	} catch (e) {
	// 		throw e;
	// 	}
	// }

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
		logger.debug('%s - member with id:%s not exists.', method, id);
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

	// async Create(stub, id) {
	// 	const method = 'Create';
	// 	logger.enter(method);

	// 	const memberID = id;
	// 	const createOption = {
	// 		id: memberID,
	// 	};

	// 	this.checkCreateOptions(createOption);
	// 	logger.debug('%s - Pass CREATE Validation', method);

	// 	this.checkAdminPermission(stub, createOption);
	// 	const exists = await this.exists(memberID);
	// 	logger.debug('%s - User %s not exists', method, memberID);

	// 	if (exists) {
	// 		logger.error('%s - User %s already exists', method, memberID);
	// 		throw new Error(util.format('User %s already exists', memberID));
	// 	}
	// 	const member = {
	// 		id: memberID,
	// 		validity: true,
	// 	};
	// 	logger.debug('%s - Result member Check in Create %j', method, member);
	// 	return this.Save(stub, member);
	// }

	/**
  	 * Verify member`s Validity
  	 * use userId to make sure
  	 */
	async GetValidity(stub, userId) {
		const method = 'GetValidity';
		logger.enter(method);
		let id = userId;
		if (!id) {
			const identityService = new IdentityService(stub);
			id = identityService.getName();
		}
		logger.debug('%s - get Member %s', method, id);
		const key = this.BUILD_MEMBER_KEY(id);
		logger.debug('%s - get key %s', method, key);
		let member = (await stub.getState(key)).toString('utf8');
		if (!member) {
			logger.error('%s - Can not find member %s', method, id);
			throw new Error(util.format('member %s does not exist', id));
		}
		member = JSON.parse(member);
		logger.debug('%s - Successfully get member from bc. %j', method, member);
		logger.exit(method);
		return member.validity;
	}

	// async Save(stub, memberObj) {
	// 	this.checkSaveOptions(memberObj);
	// 	const member = this.doCreate(stub, memberObj);
	// 	logger.debug(' - Result member Check in Save %j', member);
	// 	return member.save();
	// }


	async checkCreatePermission(options) {
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

}

module.exports = Member;
