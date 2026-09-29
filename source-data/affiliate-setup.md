# Disc Atlas retailer setup

Current links are ordinary outbound links; no earnings or affiliate relationships are claimed.
Every approval has eight retailer searches and a Disc Golf Center catalog link. Disc Golf Center’s query parameters could not be verified, so no model-specific search is claimed. Infinite model pages and matched Reaper collection pages appear above searches. Search links are not stock offers. No prices or availability are inferred.

## Programs checked September 24, 2026

- Infinite Discs: https://infinitediscs.com/affiliate-program . Apply for a website affiliate account; supports model/product deep links. Public page describes roughly 10% average cash commission (varies by product), payouts at least $50, up to monthly. Confirm actual terms in approval.
- Gotta Go Gotta Throw: https://gottagogottathrow.com/pages/collab . Ambassador program with commissions on attributed online sales and social content requirements. Ask whether a disc-directory website is eligible and whether links or discount codes are required.
- OTB, Marshall Street, Disc Golf Deals USA, Reaper, Foundation, Disc Store: shopping links enabled, but no public affiliate terms verified. Request a publisher arrangement; do not infer a partnership from a shopping link.

Paxi Disc Golf and Disc Golf Center: ordinary links added September 24, 2026. Affiliate participation and image reuse permission remain unverified.

## Activation

Owner must supply approved account-specific tracking instructions or issued deep links. No password or payout information is needed in chat. Payout/tax information belongs in each retailer's secure account.

Edit public/affiliate-config.js only after program approval. For a retailer supporting query parameters on deep links, fill its exact issued queryParams and approved:true. Otherwise map each original destination URL to its retailer-issued affiliate deep link in links. Add discountCode only when approved for this website. Do not invent URL parameter names or assume links to search results qualify. For product-only agreements, use explicit links mappings and leave queryParams empty.

The UI automatically adds an affiliate disclosure and rel=sponsored only to active tracked links. Approved codes are disclosed too. Validate using node tests/shopping.cjs (its baseline assertions assume all programs are still inactive; update those assertions when activating).

Before activation, use the program dashboard to verify attributed test clicks; follow retailer rules for test orders. The retailer dashboard is the source of truth for sales and commissions. The site does not log clicks or claim purchases.

## Request to retailers (draft; not sent)

I run Disc Atlas, an interactive directory of 2,434 PDGA approval records with flight comparisons, photos and personal bag maps. I would like to send shoppers to your store from model-specific retailer links. Do you offer a publisher affiliate program with trackable deep links? Please share eligibility, commission and attribution terms, search-link eligibility, and any product feed or approved image access. I can provide the site for review and clearly disclose affiliate relationships.

The hosted Site currently uses an invited audience. The owner must decide on public access before a public launch; access was not changed by this update.
