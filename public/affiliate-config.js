// Populate only with retailer-approved tracking instructions for Disc Atlas.
// approved + queryParams appends retailer-issued parameters to that retailer's URLs.
// approved + links maps an exact original URL to its issued affiliate deep link.
// Optional discountCode is displayed only for an approved program.
window.AtlasAffiliateConfig = {
  dgc: { approved: false, queryParams: {}, links: {}, discountCode: '' },
  paxi: { approved: false, queryParams: {}, links: {}, discountCode: '' },
  infinite: { approved: false, queryParams: {}, links: {}, discountCode: '' },
  otb: { approved: false, queryParams: {}, links: {}, discountCode: '' },
  marshall: { approved: false, queryParams: {}, links: {}, discountCode: '' },
  deals: { approved: false, queryParams: {}, links: {}, discountCode: '' },
  g3t: { approved: false, queryParams: {}, links: {}, discountCode: '' },
  reaper: { approved: false, queryParams: {}, links: {}, discountCode: '' },
  foundation: { approved: false, queryParams: {}, links: {}, discountCode: '' },
  discstore: { approved: false, queryParams: {}, links: {}, discountCode: '' }
};
