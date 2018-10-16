const MEMBER_PREFIX = 'committee.member';
const PROPOSAL_PREFIX = 'committee.proposal';
const COMMITTEE_PREFIX = 'committee.committee';


const EARTH_ACCOUNT_TYPE_ADMIN = 'admin';
const USER_ROLES = ['admin', 'user', 'contract'];

// const BASE_TOKEN = {
//   name: 'GZH',
//   symbol: 'GZH',
// };

const COMMITTEE_MODEL_MEMBER = 'Committee.Member';
const COMMITTEE_MODEL_PROPOSAL = 'Committee.Proposal';
const COMMITTEE_MODEL = 'Committee';

const GZH_COMMITTEE_CHAINCODE_NAME = 'GZH_Committee';
const GZH_COMMITTEE_CHAINCODE_ID = '8f3a4ce9-df5b-46f6-905a-17446d6cfc01';
const EARTH_CHAINCODE_ID = 'e24ea80d-d703-47a3-88af-1c69f21b025d';

module.exports = {
	COMMITTEE_PREFIX,
	MEMBER_PREFIX,
	USER_ROLES,

	GZH_COMMITTEE_CHAINCODE_NAME,
	GZH_COMMITTEE_CHAINCODE_ID,
	EARTH_CHAINCODE_ID,
};
