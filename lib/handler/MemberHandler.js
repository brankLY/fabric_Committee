/* eslint-disable no-case-declarations */
const Response = require('../utils/Response');
const logger = require('../utils/Logger').getLogger('MemberHandler');
const Member = require('../model/Member');

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
			const req = params[0];
			const member = [];
			const i = 0;
			params[0].forEach(() =>{
				member[i] = Member.Create(stub, req.pop());
				// member[i] = Member.Create(req.poll());
			});
			logger.debug('%s - initContractAccountRequest is %j', method, member);
			logger.debug('%s - exit', method);
			return Response(true, member.toString('utf8'));
		} catch (e) {
			logger.error(e);
			throw e;
		}
	}

}

module.exports = MemberHandler;
