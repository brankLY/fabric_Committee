const MEMBER_PREFIX = 'committee.member';
const TXPROPOSAL_PREFIX = 'committee.txproposal';
const MEMPROPOSAL_PREFIX = 'committee.memproposal';
const VOTE_PREFIX = 'committee.vote';
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
	TXPROPOSAL_PREFIX,
	MEMPROPOSAL_PREFIX,
	VOTE_PREFIX,

	EARTH_ACCOUNT_TYPE_ADMIN,
	USER_ROLES,

	COMMITTEE_MODEL_MEMBER,
	COMMITTEE_MODEL_PROPOSAL,
	COMMITTEE_MODEL,

	GZH_COMMITTEE_CHAINCODE_NAME,
	GZH_COMMITTEE_CHAINCODE_ID,
	EARTH_CHAINCODE_ID,

};
