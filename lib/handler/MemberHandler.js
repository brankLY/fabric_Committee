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
			// while (req.length){
			// 	member[i] = Member.Create(stub, req.pop());
			// 	// member[i] = Member.Create(req.poll());
			// 	i = math.add(i, 1)
			// }
			for(const num in req){
				const createOption = {
					id:req[num],
				};
				const member = new Member(stub);
				await member.create(createOption);
				logger.debug('%s member %s is created ',method, member.toString());
				members[i] = member;
				logger.debug('%s members has %s %s ',method, req[num], members[i].id);
				i = math.add(i, 1);
			}
			logger.debug('%s - exit', method);
			logger.debug('%s - members %j', method, members);
			return Response(true, members.toString('utf8'));
		} catch (e) {
			logger.error(e);
			throw e;
		}
	}

}

module.exports = MemberHandler;
