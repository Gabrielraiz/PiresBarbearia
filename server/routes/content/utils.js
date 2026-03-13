const DEFAULT_BUSINESS_TYPE = 'barbershop';

function getBusinessType(req, db) {
  return DEFAULT_BUSINESS_TYPE;
}

function asActive(value) {
  return value === 0 || value === false || value === '0' ? 0 : 1;
}

module.exports = { getBusinessType, asActive };
