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
		    if (!params) {
   				logger.error('%s - init Members requires found %o', method, params);
  				throw new Error('init Members requires params');
 		    }
			if (params.length !== 1){
				throw new Error('Init Committee members required params of length 1');
			}
			const req = JSON.parse(params[0]);
			logger.debug('%s - req is %j', method, req);
			const members = [];
			const memex = (await stub.getState('members')).toString('utf8');
			logger.debug('%s - record', memex);
			if (memex){
				throw new Error('committee Members already exists');
			}
			const i = 0;
			logger.debug('%s - req length is %s', method, req.length);
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
				members.push(member.id);
				logger.debug('%s members has %s %s ',method, req[num], members[i].id);
				//i = math.add(i, 1);
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

	static async GetAll(stub, params) {
		const method = 'GetAll';
		// TODO: perform complex query to check if futureBureau with this name exists
		logger.enter(method);
		let members;
		try {
			if (params.length !== 0) {
   				logger.error('%s - GetAll Members requires found %j', method, params);
  				throw new Error('GetAll Members requires params 0');
 		    }
			members = (await stub.getState('members')).toString('utf8');
			logger.debug('%s - record', members);
			if (!members) {
				logger.error('%s - Can not find members ', method);
				throw new Error('members does not exist');
			}
			members = JSON.parse(members);
			// for(const num in record){
			// 	const createOption = {
			// 		id:req[num],
			// 	};
			// 	const member1 = id;
			logger.debug('record members are %j , id is %s',members[0], members[0].id);
			logger.exit(method);
			return Response(true, members);
		} catch (e) {
			logger.error('%s - Failed to test New members Info, Error: %j', method, e.message);
			return Response(false, e.message);
		}
	}

	static async CheckValidity(stub, params) {
		const method = 'CheckValidity';
		// TODO: perform complex query to check if futureBureau with this name exists
		logger.enter(method);
		try {
			if (params.length !== 1) {
   				logger.error('%s - CheckValidity requires found %j', method, params);
  				throw new Error('CheckValidity requires params 1');
 		    }
 		    const req = JSON.parse(params[0]);
			const member = new Member(stub);
			const exists = await member.exists(req.id);
			logger.debug(' - Member %s not exists', req.id);
			if (!exists) {
				logger.error(' - Member %s not exists', req.id);
				throw new Error('Member '+req.id+' not exists');
			}
			const validity = await member.getValidity(stub, req.id);
			logger.debug('%s member %s is %s ',method, req.id, validity);
			logger.exit(method);
			return Response(true, validity);
		} catch (e) {
			logger.error('%s - Failed to test New members Info, Error: %j', method, e.message);
			return Response(false, e.message);
		}
	}

}

module.exports = MemberHandler;
