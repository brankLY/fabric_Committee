/* eslint-disable no-case-declarations */
const Response = require('../utils/Response');
const logger = require('../utils/Logger').getLogger('MemberHandler');
const Member = require('../model/Member');

const math = require('mathjs');

class MemberHandler {
	/**
   * Sample code for create new contract account on Earth chaincode
   * This method will create an account of type "contract" at Earth
   *
   * @param {ChaincodeStub} stub
   * @param {string} contractAccountId the contract account for this Dapp at Earth
  */
	static async Init(stub, params) {
		const method = 'Init';
		logger.debug('%s - enter', method);
		try {
			logger.debug('%s - Init Committee members : %j', method, params);
			if (params.length !== 1){
				throw new Error('Init Committee members required params of length 1');
			}
			const req = JSON.parse(params[0]);
			logger.debug('%s - req is %j', method, req);
			const members = [];
			let i = 0;
			logger.debug('%s - req length is %s', method, req.length);
			for(const js2 in req){
				logger.debug('%s req has %s %s ',method, js2, req[js2]);
			}
			for(const num in req){
				const createOption = {
					id:req[num],
				};
				const member = new Member(stub);
				const exists = await member.exists(createOption.id);
				logger.debug(' - Member %s not exists', createOption.id);
				if (exists) {
					logger.error(' - Member %s already exists', createOption.id);
					throw new Error('Member '+createOption.id+' already exists');
				}
				await member.create(createOption);
				logger.debug('%s member %s is created ',method, member.toString());
				members[i] = member;
				logger.debug('%s members has %s %s ',method, req[num], members[i].id);
				i = math.add(i, 1);
			}
			logger.debug('%s - exit', method);
			logger.debug('%s - members %j', method, members);
			await stub.putState('members', Buffer.from(JSON.stringify(members)));
			return Response(true, members);
		} catch (e) {
			logger.error(e);
			return Response(false, e.message);
		}
	}

	static async getAll(stub) {
		const method = 'static:getAll';
		// TODO: perform complex query to check if futureBureau with this name exists
		logger.enter(method);
		let record;
		try {
			record = (await stub.getState('members')).toString('utf8');
			logger.debug('%s - record', record);
		} catch (e) {
			logger.error('%s - Failed to test New members Info, Error: %j', method, e.message);
			throw e;
		}
		if (!record) {
			logger.error('%s - Can not find members ', method);
			throw new Error('members does not exist');
		}
		record = JSON.parse(record);
		return record;
	}

}

module.exports = MemberHandler;
