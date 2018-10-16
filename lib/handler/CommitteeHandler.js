/* eslint-disable no-case-declarations */
const Response = require('../utils/Response');
const {
	GZH_COMMITTEE_CHAINCODE_NAME,
	GZH_COMMITTEE_CHAINCODE_ID,
	EARTH_CHAINCODE_ID,
} = require('../utils/Constants');
const logger = require('../utils/Logger').getLogger('handler');

class CommitteeHandler {
	/**
   * Sample code for create new contract account on Earth chaincode
   * This method will create an account of type "contract" at Earth
   *
   * @param {ChaincodeStub} stub
   * @param {string} contractAccountId the contract account for this Dapp at Earth
  */
	static async initContractAccount(stub) {
		const method = 'initContractAccount';
		logger.debug('%s - enter', method);
		try {
			logger.debug('%s - Init Committee contractAccount name: %s,id: %s', method, GZH_COMMITTEE_CHAINCODE_NAME, GZH_COMMITTEE_CHAINCODE_ID);
			await stub.putState(GZH_COMMITTEE_CHAINCODE_NAME, Buffer.from(GZH_COMMITTEE_CHAINCODE_ID));
			const initContractAccountRequest = {
				id: GZH_COMMITTEE_CHAINCODE_ID,
				name: GZH_COMMITTEE_CHAINCODE_NAME,
				role: 'contract',
			};
			logger.debug('%s - initContractAccountRequest is %j', method, initContractAccountRequest);
			const account = await stub.invokeChaincode(EARTH_CHAINCODE_ID, ['account.create', JSON.stringify(initContractAccountRequest)]);
			logger.debug('Successfully created contractAccount %s', account.payload.toString('utf8'));
			logger.debug('%s - exit', method);
			return Response(true, account.payload.toString('utf8'));
		} catch (e) {
			logger.error(e);
			throw e;
		}
	}

}

module.exports = CommitteeHandler;
