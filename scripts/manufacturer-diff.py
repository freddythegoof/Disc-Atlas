#!/usr/bin/env python3
"""Read-only Atlas/manufacturer flight-number audit. Python 3.10+, stdlib only.

Run FROM the repository root (Windows; no execution-policy changes/shims needed):
  python scripts/manufacturer-diff.py
  python scripts/manufacturer-diff.py --sampling-audit ../disc-atlas-twin2/docs/sampling-audit.md
  python scripts/manufacturer-diff.py --offline  # rebuild from cached HTTP responses
  python scripts/manufacturer-diff.py --brand Innova --limit 10 --output outputs/pilot.md

Only --output and --cache are written. Defaults: docs/manufacturer-diff.md and
outputs/manufacturer-diff/ (already gitignored). Missing exclusion files are fatal.
Rated discs are the default comparison pool; --include-unrated also visits records
with no Atlas baseline (reported separately, never flagged). Historical approvals
are not silently mapped to current molds. No community/retailer numbers are used.

Resolution: official Atlas source URLs, documented brand patterns, matching links
from the brand's catalog, then a public web search for brand + mold + flight numbers.
Search results only discover official URLs; snippets never supply flight numbers.
Pages AND HTTP failures are cached by URL, indefinitely, with timestamps. Use a
new --cache directory for a fresh audit. All uncached HTTP requests, including
redirect hops and searches, share a >=1-second start interval. No browser/JS engine.

Brand patterns below are candidates, not assertions that an absent/historical
disc exists. Shopify collection pages are preferred to plastic/run product pages.
Fallback product pages retain their exact product title as evidence in the report.
"""

import argparse
import base64
import collections
import datetime
import hashlib
import html
from html.parser import HTMLParser
import json
import math
import pathlib
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

FIELDS = ('speed', 'glide', 'turn', 'fade')
NUMBER = r'[+\-]?(?:\d+(?:\.\d+)?|\.\d+)'

# Official domains are an explicit allowlist. Infinite's own brand is the ONLY
# case where its retailer/catalog site is accepted as the manufacturer's site.
# An unfamiliar brand gets a web-search attempt but remains manual until its
# official domain is added here; never infer manufacturer ownership from SEO.
BRANDS = {
    # WordPress model pages; dedicated rating-<field> badge parser.
    'Innova': ('innovadiscs.com', 'https://www.innovadiscs.com/disc/{slug}/'),
    'Innova Factory Store': ('innovadiscs.com|proshop.innovadiscs.com', 'https://www.innovadiscs.com/disc/{slug}/'),
    # Shared WordPress layout: /discs/<mold>/ and power-meter spans + superscripts.
    'MVP': ('mvpdiscsports.com', 'https://mvpdiscsports.com/discs/{slug}/'),
    'Axiom': ('axiomdiscs.com', 'https://axiomdiscs.com/discs/{slug}/'),
    'Streamline': ('streamlinediscs.com', 'https://streamlinediscs.com/discs/{slug}/'),
    # Shopify model collections; dedicated collection-number/badge parsers.
    'Discmania': ('discmania.net', 'https://www.discmania.net/collections/{slug}'),
    'Latitude 64': ('latitude64.com|latitude64.se', 'https://latitude64.com/collections/{slug}'),
    'Dynamic Discs': ('dynamicdiscs.com', 'https://www.dynamicdiscs.com/collections/dynamic-discs-{slug}'),
    'Westside Discs': ('westsidediscs.com|westside.fi', 'https://westsidediscs.com/collections/{slug}'),
    'Kastaplast': ('kastaplast.com|kastaplast.se', 'https://kastaplast.com/collections/{slug}'),
    'Mint Discs': ('mintdiscs.com', 'https://mintdiscs.com/collections/{slug}'),
    'Prodigy': ('prodigydisc.com', 'https://www.prodigydisc.com/collections/{slug}'),
    'Gateway': ('gatewaydiscsports.com|gatewaydiscs.com', 'https://gatewaydiscsports.com/collections/{slug}'),
    'Lone Star Discs': ('lonestardiscs.com|lonestardisc.com', 'https://www.lonestardiscs.com/collections/{slug}'),
    'Thought Space Athletics': ('thoughtspaceathletics.com', 'https://thoughtspaceathletics.com/collections/{slug}'),
    'Elevation Disc Golf': ('elevationdiscs.com', 'https://elevationdiscs.com/collections/{slug}'),
    'Hooligan Discs': ('hooligandiscs.com', 'https://hooligandiscs.com/collections/{slug}'),
    'Climo Disc Golf': ('climodiscgolf.com', 'https://climodiscgolf.com/collections/{slug}'),
    # WordPress/WooCommerce catalogs; product slugs discovered if pattern fails.
    'Daredevil Discs': ('daredevildiscs.com', 'https://daredevildiscs.com/product/{slug}/'),
    'Doomsday Discs': ('doomsdaydiscs.com', 'https://doomsdaydiscs.com/collections/{slug}'),
    'DGA': ('discgolf.com', 'https://discgolf.com/{slug}/'),
    'RPM': ('rpmdiscs.com', 'https://www.rpmdiscs.com/product/{slug}/'),
    'Prodiscus': ('prodiscus.fi|prodiscus.com', 'https://prodiscus.fi/discs/{slug}/'),
    'Legacy': ('legacydiscs.com', 'https://legacydiscs.com/discs/{slug}/'),
    'Millennium': ('golfdisc.com', 'https://www.golfdisc.com/disc-golf-discs/{slug}/'),
    'Divergent Discs': ('divergentdiscs.com', 'https://divergentdiscs.com/{slug}/'),
    'Clash Discs': ('clashdiscs.com', 'https://clashdiscs.com/pages/{slug}'),
    'Above Ground Level': ('agldiscs.com', 'https://www.agldiscs.com/collections/{slug}'),
    'Trash Panda Disc Golf': ('trashpandadiscgolf.com', 'https://trashpandadiscgolf.com/pages/{slug}'),
    'Infinite Discs': ('infinitediscs.com', 'https://infinitediscs.com/infinite-discs-{slug}'),
    # Team Discraft uses Wix. If only a JS shell is available it stays unresolved.
    'Discraft': ('discraft.com|team.discraft.com', 'https://www.team.discraft.com/discs/{slug}'),
    # No reliable mold URL pattern: official catalog links + web search.
    'Yikun': ('yikunsports.com|yikundiscs.com', None),
    'Vibram Disc Golf': ('vibram.com|vibramdiscgolf.com', None),
    'EV-7': ('ev-7discgolf.com|ev7discgolf.com', None),
    'Finish Line': ('finishlinediscs.com', None),
    'Wild Discs': ('wilddiscs.com', None),
    'Jester Disc Golf': ('jesterdiscgolf.com', None),
    'Stokely Discs': ('stokelydiscs.com', None),
    'Løft Discs': ('loftdiscs.com', None),
    'Disctroyer OÜ': ('disctroyer.com', None),
    'Crosslap': ('crosslap.de', None),
    'Bernoulli Disc Golf': ('bernoullidiscgolf.com', None),
    'Sacred Discs': ('sacreddiscs.com', None),
    'Alfa Discs': ('alfadiscs.com', None),
    'Storm': ('stormdiscs.com', None),
    'Birdie': ('birdiediscgolfsupply.com', None),
    'Neptune Discs': ('neptunediscs.com', None),
    'AquaFlight': ('aquaflightdiscs.com', None),
    'Lightning': ('lightningdiscs.com', None),
}

# Catalogs with searchable mold/product links. Shared pages are fetched once.
INDEX_PATHS = {
    'Discraft': ['/disc-golf/'], 'Mint Discs': ['/'],
    'DGA': ['/disc-golf-discs/'], 'Doomsday Discs': ['/discs/'],
    'Daredevil Discs': ['/disc-golf-discs/'], 'RPM': ['/discs/'],
    'Legacy': ['/discs/'], 'Millennium': ['/disc-golf-discs/'],
    'Prodigy': ['/collections/all-discs'], 'Infinite Discs': ['/'],
}


def norm(value):
    value = unicodedata.normalize('NFKD', html.unescape(str(value))).casefold()
    value = ''.join(c for c in value if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', value).strip()


def base_name(name):
    return re.sub(r'\s*\([^)]*\)\s*', ' ', name).strip()


def mold_key(d):
    return norm(d['brand']), norm(base_name(d['name']))


def rated(d):
    return all(isinstance(d.get(k), (int, float)) and not isinstance(d.get(k), bool)
               and math.isfinite(d[k]) for k in FIELDS)


def select_discs(discs, documents, include_unrated=False):
    """Exclude IDs, brand/mold headings and review/sample table entries.

    IDs anywhere in a document also exclude its base mold's approval aliases.
    Mold-only tables exclude a name only if it has a unique catalog brand, or
    an explicit heading/ID supplies the brand. Never use a loose text substring.
    """
    by_id = {d['id']: d for d in discs}
    excluded_ids = set()
    keys = set()
    brands = {norm(d['brand']): d['brand'] for d in discs}
    names = collections.defaultdict(set)
    for d in discs:
        names[norm(base_name(d['name']))].add(norm(d['brand']))
    for document in documents:
        for ident in re.findall(r'\b[0-9a-f]{12}\b', document, re.I):
            if ident.lower() in by_id:
                excluded_ids.add(ident.lower())
                keys.add(mold_key(by_id[ident.lower()]))
        headers = None
        for line in document.splitlines():
            if re.match(r'^#{2,6}\s', line):
                heading = re.sub(r'^#+\s*', '', line).replace('**', '').replace('`', '')
                parts = re.split(r'\s+[—–]\s+|\s+-\s+', heading, maxsplit=1)
                if len(parts) == 2:
                    brand = norm(re.sub(r'\s*\(.*', '', parts[1]))
                    if brand in brands:
                        keys.add((brand, norm(base_name(parts[0]))))
            if not line.lstrip().startswith('|'):
                headers = None
                continue
            cells = [c.strip().strip('*` ') for c in line.strip().strip('|').split('|')]
            lowered = [norm(c) for c in cells]
            if any(c in ('disc', 'mold', 'name') for c in lowered):
                headers = lowered
                continue
            if not headers or len(cells) != len(headers) or all(re.fullmatch(r'[-: ]*', c) for c in cells):
                continue
            idx = next((i for i, c in enumerate(headers) if c in ('disc', 'mold', 'name')), None)
            if idx is None:
                continue
            name = norm(base_name(re.sub(r'\s*\(id\s+[^)]*\)', '', cells[idx])))
            if 'brand' in headers:
                brand = norm(cells[headers.index('brand')])
                if brand in brands:
                    keys.add((brand, name))
            elif len(names.get(name, set())) == 1:
                keys.add((next(iter(names[name])), name))
    excluded = [d for d in discs if d['id'] in excluded_ids or mold_key(d) in keys]
    pool = [d for d in discs if d['id'] not in excluded_ids and mold_key(d) not in keys]
    eligible = [d for d in pool if include_unrated or rated(d)]
    return eligible, dict(catalog=len(discs), excluded=len(excluded),
                         unrated=sum(not rated(d) for d in pool), eligible=len(eligible))


class Node:
    def __init__(self, tag='', attrs=None, parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs or []), parent, []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def text(self, sep=' '):
        if self.tag in ('script', 'style', 'noscript', 'svg'):
            return ''
        return sep.join(c.text(sep) if isinstance(c, Node) else c for c in self.children)


class Page(HTMLParser):
    VOID = set('area base br col embed hr img input link meta param source track wbr'.split())

    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.current = self.root
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.current)
        self.current.children.append(node)
        if tag not in self.VOID:
            self.current = node

    def handle_startendtag(self, tag, attrs):
        self.current.children.append(Node(tag, attrs, self.current))

    def handle_endtag(self, tag):
        node = self.current
        while node.parent:
            if node.tag == tag:
                self.current = node.parent
                return
            node = node.parent

    def handle_data(self, data):
        self.current.children.append(data)


def clean(text):
    return re.sub(r'\s+', ' ', html.unescape(text).replace('−', '-').replace('–', '-')).strip()


def config(brand):
    return next((v for k, v in BRANDS.items() if norm(k) == norm(brand)), ('', None))


def is_official(url, brand):
    try:
        parsed = urllib.parse.urlsplit(url)
        host = (parsed.hostname or '').lower()
        domains = config(brand)[0].split('|')
        return parsed.scheme in ('http', 'https') and any(d and (host == d or host.endswith('.' + d)) for d in domains)
    except ValueError:
        return False


def valid_numbers(numbers):
    return len(numbers) == 4 and all(math.isfinite(v) for v in numbers) and (
        0 < numbers[0] <= 15 and 0 <= numbers[1] <= 8 and -6 <= numbers[2] <= 2 and 0 <= numbers[3] <= 6)


def identify(title, d):
    """Exact mold identity after removing explicit plastic/brand descriptors.

    Word boundaries alone are insufficient (Zone vs Zone OS, Leopard vs Leopard3).
    Do not remove edition suffixes such as OS, X, SS, Reborn, or Junior.
    """
    target = norm(base_name(d['name']))
    if norm(d['brand']) == 'above ground level':
        title = re.sub(r'^AGL Discs\s*-\s*', '', title, flags=re.I)
        value = norm(base_name(title))
        if value == target or value.endswith(' ' + target):
            return True  # AGL's color + plastic + mold + (stamp) product naming.
    title = re.split(r'\s+[|–—]\s+|\s+-\s+', title)[0]
    title = re.sub(r'^Collection\s*:\s*', '', title, flags=re.I)
    title = re.sub(r'\s+' + NUMBER + r'\s*/\s*' + NUMBER + r'\s*/\s*' + NUMBER + r'\s*/\s*' + NUMBER + r'\s*$', '', title)
    if norm(d['brand']) == 'daredevil discs':
        title = re.sub(r'\s+' + NUMBER + r'\s*,\s*' + NUMBER + r'\s*,\s*' + NUMBER + r'\s*,\s*' + NUMBER + r'\s*$', '', title)
    value = norm(base_name(title))
    brand = norm(d['brand'])
    if value.startswith(brand + ' '):
        value = value[len(brand) + 1:]
    # Plain product titles often prefix the manufacturer/plastic to the mold.
    plastic = r'(?:innova|discraft|prodigy|discmania|dynamic discs|westside discs|latitude 64|kastaplast|mint discs|k1|k2|k3|k1 soft|k1 hard|z|z line|big z|esp|esp flx|elite z|d line|s line|c line|p line|q line|star|halo star|champion|dx|pro|gstar|neutron|proton|plasma|fission|electron|eclipse|cosmic neutron|lucid|fuzion|prime|opto|gold|retro|vip|tournament|bt hard|bt soft|bt medium|400|400g|500|300|300 soft|750|proline|spark|sp line|signature line|granite) '
    while True:
        stripped = re.sub(r'^' + plastic, '', value)
        if stripped == value:
            break
        value = stripped
    value = re.sub(r' (?:plastic|disc golf disc|disc golf distance driver|disc golf fairway driver|disc|putter|midrange|fairway driver|distance driver)$', '', value)
    if value.startswith(target + ' ') and re.fullmatch(r'(?:400|400g|500|300|300 soft|750|k1|k2|k3|star|champion|dx|neutron|proton|plasma|fission|electron|s line|c line|d line)', value[len(target) + 1:]):
        value = target
    return value == target


def noise(node):
    while node:
        attr = ' '.join([node.attrs.get('class', ''), node.attrs.get('id', '')]).lower()
        if node.tag in ('nav', 'footer', 'script', 'style', 'noscript') or any(
            k in attr for k in ('recommendation', 'related-products', 'related_products', 'product-card',
                               'product__details', 'card-product', 'jdgm', 'review', 'mega-menu', 'filter')):
            return True
        node = node.parent
    return False


def tuples_in(text, d, slash=True):
    text = clean(text)
    out = []
    forward = r'\bSpeed\s*[:=]?\s*(' + NUMBER + r').{0,60}?\bGlide\s*[:=]?\s*(' + NUMBER + r').{0,60}?\bTurn\s*[:=]?\s*(' + NUMBER + r').{0,60}?\bFade\s*[:=]?\s*(' + NUMBER + r')(?![\d.])'
    reverse = r'(' + NUMBER + r')\s*Speed\b.{0,110}?(' + NUMBER + r')\s*Glide\b.{0,110}?(' + NUMBER + r')\s*Turn\b.{0,110}?(' + NUMBER + r')\s*Fade\b'
    for pattern in (forward, reverse):
        for match in re.finditer(pattern, text, re.I):
            values = [float(v) for v in match.groups()]
            if valid_numbers(values):
                out.append(values)
    if slash:
        pattern = r'(?<![\w/.])(' + NUMBER + r')\s*/\s*(' + NUMBER + r')\s*/\s*(' + NUMBER + r')\s*/\s*(' + NUMBER + r')(?!\d)'
        mold = norm(base_name(d['name']))
        for match in re.finditer(pattern, text):
            nearby = norm(text[max(0, match.start() - 140):match.end() + 60])
            values = [float(v) for v in match.groups()]
            if re.search(r'(?<!\w)' + re.escape(mold) + r'(?!\w)', nearby) and valid_numbers(values):
                out.append(values)
    return out


def parse_flights(source, d):
    page = Page(source)
    nodes = list(page.root.walk())
    headings = [n for n in nodes if n.tag == 'h1' and not noise(n)]
    title = next((clean(n.text()) for n in headings if identify(clean(n.text()), d)), '')
    result = dict(numbers=None, reason='page identity does not match mold', parser='', title=title)
    if not title:
        if not headings and ('wix' in source.lower() or ('<script' in source and len(clean(page.root.text())) < 200)):
            result['reason'] = 'JS-rendered shell; no readable model/rating content'
        return result
    # Do not compare a historical/retooled approval to an unqualified current page.
    edition = re.search(r'\(([^)]*(?:\bold\b|\boriginal\b|\bretool\w*\b|\bnew\b)[^)]*)\)', d['name'], re.I)
    if edition and not is_official(d.get('flightSource', ''), d['brand']):
        result['reason'] = 'approval/version-specific mold; current-page identity needs manual review'
        return result

    def finish(values, parser):
        unique = sorted(set(tuple(v) for v in values if valid_numbers(v)))
        result['parser'] = parser
        if len(unique) == 1:
            result['numbers'] = list(unique[0]); result['reason'] = ''
        elif len(unique) > 1:
            result['reason'] = 'conflicting flight numbers/plastics on manufacturer page'
        else:
            result['reason'] = 'parse failed: no complete flight-number set in model content'
        return result

    heading_values = tuples_in(title, d)
    if heading_values:
        return finish(heading_values, 'manufacturer model title ratings')

    if norm(d['brand']) == 'daredevil discs':
        pattern = r'(' + NUMBER + r')\s*,\s*(' + NUMBER + r')\s*,\s*(' + NUMBER + r')\s*,\s*(' + NUMBER + r')\s*$'
        match = re.search(pattern, title)
        if match:
            return finish([[float(v) for v in match.groups()]], 'Daredevil model title ratings')

    # Innova badge values precede labels and contain verbose tooltip HTML.
    if norm(d['brand']) in ('innova', 'innova factory store'):
        fields = {}
        for field in FIELDS:
            values = []
            for n in nodes:
                if 'rating-' + field in n.attrs.get('class', '').split() and not noise(n):
                    badges = [x for x in n.walk() if 'flight-ratings' in x.attrs.get('class', '').split()]
                    for b in badges:
                        if re.fullmatch(NUMBER, clean(b.text())):
                            values.append(float(clean(b.text())))
            if len(set(values)) == 1:
                fields[field] = values[0]
        if len(fields) == 4:
            return finish([[fields[k] for k in FIELDS]], 'Innova rating badges')
    # MVP family: -0 in <span> and .5 in <sup> MUST concatenate to -0.5.
    meters = [n for n in nodes if 'power-meter' in n.attrs.get('class', '').split() and not noise(n)]
    if meters:
        values = []
        for meter in meters:
            entries = [c for c in meter.children if isinstance(c, Node) and c.tag == 'div']
            raw = [re.sub(r'\s+', '', c.text('')) for c in entries]
            if len(raw) == 4 and all(re.fullmatch(NUMBER, v) for v in raw):
                values.append([float(v) for v in raw])
        return finish(values, 'MVP-family power meter')
    # Discmania's explicit collection baseline takes precedence over product cards.
    for n in nodes:
        if 'collection-numbers' in n.attrs.get('class', '').split() and not noise(n):
            return finish(tuples_in(n.text(), d, slash=False), 'Discmania collection numbers')
    rating_blocks = [n for n in nodes if not noise(n) and any(
        k in n.attrs.get('class', '').lower() for k in ('flight-numbers', 'flight-numbers-container', 'disc-flight'))]
    values = []
    for n in rating_blocks:
        if len(n.text()) < 1200:
            values.extend(tuples_in(n.text(), d, slash=False))
    if values:
        return finish(values, 'manufacturer labeled flight badges')
    # Shopify/WooCommerce primary description. Related cards/reviews excluded.
    descriptions = [n for n in nodes if not noise(n) and any(
        k in (n.attrs.get('class', '') + ' ' + n.attrs.get('id', '')).lower()
        for k in ('product-description', 'product__description', 'product-single__description',
                  'product_description', 'collection__description', 'collection-hero__description',
                  'collection-description', 'collection_description', 'product-details__description',
                  'woocommerce-product-details__short-description', 'tab-description'))]
    if descriptions:
        values = []
        for n in descriptions:
            values.extend(tuples_in(n.text(), d))
            if norm(d['brand']) == 'kastaplast':
                pattern = r'(' + NUMBER + r')\s*\|\s*(' + NUMBER + r')\s*\|\s*(' + NUMBER + r')\s*\|\s*(' + NUMBER + r')'
                values.extend([float(v) for v in match.groups()] for match in re.finditer(pattern, clean(n.text())))
        if values:
            return finish(values, 'primary product/collection description')
    # Visible model content after H1, before product listings/reviews. Do not let
    # boilerplate menus, inline JS/JSON, or recommended molds supply ratings.
    start = next(i for i, n in enumerate(nodes) if n in headings and clean(n.text()) == title)
    values = []
    for n in nodes[start:]:
        cls = n.attrs.get('class', '').lower()
        if any(k in cls for k in ('product-grid', 'collection-grid', 'product-list', 'recommendation')):
            break
        if n.tag in ('p', 'ul', 'table', 'dl') and not noise(n):
            values.extend(tuples_in(n.text(), d))
    return finish(values, 'visible labels / mold-local slash fallback')


def compare(d, actual):
    deltas = [round(actual[i] - d[k], 6) for i, k in enumerate(FIELDS)]
    severity = max(abs(deltas[2]), abs(deltas[3]))
    return dict(numbers=actual, deltas=deltas, severity=severity, flagged=severity >= 0.5)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class HttpCache:
    def __init__(self, directory, delay=1.0, timeout=15, offline=False):
        self.directory = pathlib.Path(directory)
        self.directory.mkdir(parents=True, exist_ok=True)
        self.delay, self.timeout, self.offline = delay, timeout, offline
        self.last_request = 0
        self.requests, self.hits = 0, 0
        self.blocked = {}
        self.errors = collections.Counter()
        self.opener = urllib.request.build_opener(NoRedirect())

    def get(self, url):
        path = self.directory / (hashlib.sha256(url.encode()).hexdigest() + '.json')
        if path.exists():
            try:
                record = json.loads(path.read_text(encoding='utf-8'))
                if record.get('url') == url:
                    self.hits += 1
                    return record
            except (ValueError, OSError):
                pass  # a damaged cache entry is fetched again (or offline-missing)
        if self.offline:
            return dict(url=url, final_url=url, status=0, html='', error='offline: page not cached')
        current = url
        record = dict(url=url, final_url=url, status=0, html='', error=None,
                      fetched_at=datetime.datetime.now(datetime.timezone.utc).isoformat())
        for hop in range(6):
            host = urllib.parse.urlsplit(current).hostname
            if host in self.blocked:
                record['error'] = self.blocked[host]
                break
            time.sleep(max(0, self.last_request + self.delay - time.monotonic()))
            self.last_request = time.monotonic()
            self.requests += 1
            try:
                req = urllib.request.Request(current, headers={
                    'User-Agent': 'Mozilla/5.0 (compatible; DiscAtlasManufacturerAudit/1.0; read-only research)',
                    'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'en-US,en;q=0.8'})
                with self.opener.open(req, timeout=self.timeout) as response:
                    record['status'] = response.status
                    record['final_url'] = response.url
                    raw = response.read(4_000_001)
                    if len(raw) > 4_000_000:
                        record['error'] = 'page exceeds 4 MB size limit'
                    else:
                        encoding = response.headers.get_content_charset() or 'utf-8'
                        record['html'] = raw.decode(encoding, errors='replace')
                break
            except urllib.error.HTTPError as error:
                record['status'], record['final_url'] = error.code, current
                if error.code in (301, 302, 303, 307, 308) and error.headers.get('Location'):
                    target = urllib.parse.urljoin(current, error.headers['Location'])
                    error.close()
                    if urllib.parse.urlsplit(target).scheme not in ('http', 'https'):
                        record['error'] = 'non-HTTP redirect'; break
                    current = target
                    if hop == 5:
                        record['error'] = 'too many redirects'
                    continue
                record['error'] = 'HTTP ' + str(error.code)
                if error.code == 429:
                    self.blocked[host] = 'HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: ' + error.headers.get('Retry-After', 'unspecified') + ')'
                error.close()
                break
            except (OSError, ValueError) as error:
                record['error'] = str(error)
                self.errors[host] += 1
                if self.errors[host] >= 3:
                    self.blocked[host] = 'host unreachable after three HTTP attempts: ' + str(error)
                break
            finally:
                # Space requests after response completion too; slow redirect
                # delivery must never cause the next hop to arrive in a burst.
                self.last_request = time.monotonic()
        temporary = path.with_suffix('.tmp')
        temporary.write_text(json.dumps(record, ensure_ascii=False), encoding='utf-8')
        temporary.replace(path)
        if record['final_url'] != url and not record['error']:
            final_path = self.directory / (hashlib.sha256(record['final_url'].encode()).hexdigest() + '.json')
            alias = dict(record, url=record['final_url'])
            final_path.write_text(json.dumps(alias, ensure_ascii=False), encoding='utf-8')
        return record


def unwrap_search(url):
    url = html.unescape(url)
    query = urllib.parse.parse_qs(urllib.parse.urlsplit(url).query)
    if 'uddg' in query:
        return query['uddg'][0]
    if 'u' in query and query['u'][0].startswith('a1'):
        encoded = query['u'][0][2:]
        try:
            return base64.urlsafe_b64decode(encoded + '=' * (-len(encoded) % 4)).decode()
        except (ValueError, UnicodeError):
            return ''
    if url.startswith('/url?'):
        return query.get('q', query.get('url', ['']))[0]
    return url


def model_link(url, d, label=''):
    path = norm(urllib.parse.unquote(urllib.parse.urlsplit(url).path))
    mold = norm(base_name(d['name']))
    return bool(mold and (re.search(r'(?<!\w)' + re.escape(mold) + r'(?!\w)', path)
                         or identify(label, d)))


def search_urls(source, d):
    urls = []
    for node in Page(source).root.walk():
        if node.tag != 'a':
            continue
        url = unwrap_search(node.attrs.get('href', ''))
        if is_official(url, d['brand']) and model_link(url, d, clean(node.text())):
            url = urllib.parse.urldefrag(url)[0]
            if url not in urls:
                urls.append(url)
    return urls


class Resolver:
    def __init__(self, http):
        self.http = http
        self.indices = {}

    def catalog_links(self, d):
        brand = d['brand'].strip()
        if brand not in self.indices:
            domain = config(brand)[0].split('|')[0]
            links = []
            if domain:
                paths = list(dict.fromkeys(INDEX_PATHS.get(brand, []) + ['/collections/all', '/']))
                if brand == 'DGA':
                    paths.insert(0, 'https://store.discgolf.com/collections/dga-disc-golf-discs')
                for path in paths:
                    url = path if path.startswith('https://') else 'https://' + domain + path
                    response = self.http.get(url)
                    if not response['error'] and is_official(response['final_url'], brand):
                        for n in Page(response['html']).root.walk():
                            if n.tag == 'a':
                                target = urllib.parse.urljoin(response['final_url'], n.attrs.get('href', ''))
                                if is_official(target, brand):
                                    links.append((urllib.parse.urldefrag(target)[0], clean(n.text())))
            self.indices[brand] = list(dict.fromkeys(links))
        matching = [u for u, label in self.indices[brand] if model_link(u, d, label)]
        # Model landing pages first; prefer ordinary products over tour/run releases.
        return sorted(set(matching), key=lambda u: ('/products/' in u or '/product/' in u, len(u)))[:6]

    def search(self, d):
        query = f'{d["brand"].strip()} {base_name(d["name"])} flight numbers'
        notes = []
        # DuckDuckGo HTML is readable without JS when not challenged. Bing is
        # the secondary provider, with base64 redirect links decoded locally.
        for prefix in ('https://html.duckduckgo.com/html/?q=', 'https://www.bing.com/search?q='):
            url = prefix + urllib.parse.quote_plus(query)
            response = self.http.get(url)
            if response['error']:
                notes.append('web search ' + response['error']); continue
            urls = search_urls(response['html'], d)
            if urls:
                return urls[:4], notes
            source = response['html'].lower()
            if 'anomaly' in source or 'captcha' in source or response['status'] == 202:
                notes.append('web search blocked/challenged')
            else:
                notes.append('web search found no matching official URL')
        return [], notes

    def resolve(self, d):
        attempts = []
        seen = set()
        observed_js = False

        def try_urls(urls):
            nonlocal observed_js
            pending = list(dict.fromkeys(urls))
            followed = 0
            for url in pending:
                if url in seen or not is_official(url, d['brand']):
                    continue
                seen.add(url)
                response = self.http.get(url)
                if response['error']:
                    attempts.append(dict(url=url, reason=response['error'])); continue
                if not is_official(response['final_url'], d['brand']):
                    attempts.append(dict(url=url, reason='redirect outside official manufacturer domains')); continue
                parsed = parse_flights(response['html'], d)
                if parsed['numbers']:
                    return dict(disc=d, status='checked' if rated(d) else 'no_baseline',
                                url=response['final_url'], fetched_at=response.get('fetched_at', 'earlier cached fetch'),
                                parser=parsed['parser'], title=parsed['title'], attempts=attempts,
                                **(compare(d, parsed['numbers']) if rated(d) else dict(numbers=parsed['numbers'])))
                observed_js |= parsed['reason'].startswith('JS-rendered')
                attempts.append(dict(url=response['final_url'], reason=parsed['reason']))
                if parsed['reason'].startswith(('conflicting', 'approval/version')):
                    return dict(disc=d, status='unresolved', reason=parsed['reason'], url=response['final_url'], attempts=attempts, js_rendered=observed_js)
                if '/collections/' in response['final_url'] and followed < 4:
                    links = []
                    for n in Page(response['html']).root.walk():
                        if n.tag == 'a':
                            target = urllib.parse.urljoin(response['final_url'], n.attrs.get('href', ''))
                            if '/products/' in target and is_official(target, d['brand']) and model_link(target, d, clean(n.text())):
                                links.append(urllib.parse.urldefrag(target)[0])
                    for target in sorted(set(links), key=lambda u: (bool(re.search(r'tour|limited|special|shirt|towel|misprint', u, re.I)), len(u))):
                        if followed >= 4:
                            break
                        if target not in pending and target not in seen:
                            pending.append(target); followed += 1
            return None

        source_urls = [d.get('flightSource', ''), d.get('production', {}).get('source', '')]
        _, pattern = config(d['brand'])
        if pattern:
            slug = norm(base_name(d['name'])).replace(' ', '-')
            source_urls.append(pattern.format(slug=slug))
        found = try_urls(source_urls)
        if found:
            return found
        found = try_urls(self.catalog_links(d))
        if found:
            return found
        searched, notes = self.search(d)
        found = try_urls(searched)
        if found:
            return found
        reasons = list(dict.fromkeys(a['reason'] for a in attempts))
        reason = '; '.join(reasons[-4:] + notes) or 'no page found'
        if not config(d['brand'])[0]:
            reason = 'official manufacturer domain not configured; ' + reason
        return dict(disc=d, status='unresolved', reason=reason,
                    url=attempts[-1]['url'] if attempts else '', attempts=attempts, js_rendered=observed_js)


def fmt(number):
    return f'{number:g}' if number is not None else '—'


def flights(numbers):
    return '/'.join(fmt(v) for v in numbers)


def escape(text):
    return str(text).replace('|', '\\|').replace('\n', ' ').replace('\r', '').replace('<', '&lt;').replace('>', '&gt;')


def link(url):
    return '[page](' + url.replace(' ', '%20').replace(')', '%29').replace('(', '%28') + ')' if url else '—'


def render_report(rows, stats, inputs, complete=True, command='', transport=None):
    checked = [r for r in rows if r['status'] == 'checked']
    flagged = sorted((r for r in checked if r['flagged']),
                     key=lambda r: (-r['severity'], -sum(abs(v) for v in r['deltas'][2:]), r['disc']['brand'], r['disc']['name']))
    unresolved = sorted((r for r in rows if r['status'] == 'unresolved'), key=lambda r: (r['disc']['brand'], r['disc']['name']))
    info = [r for r in checked if any(r['deltas'][:2])]
    no_baseline = [r for r in rows if r['status'] == 'no_baseline']
    now = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
    out = ['# Manufacturer flight-number diff', '',
           f'Generated {now}. **Research queue only; no overrides or catalog data changed.**', '',
           f'Run status: **{"complete" if complete else "partial / checkpoint"}**. Scope: rated catalog records minus covered molds; unrated records are included only with `--include-unrated`.', '',
           f'- Full catalog: **{stats["catalog"]}** records.',
           f'- Already covered / excluded: **{stats["excluded"]}** records (IDs and brand/base-mold aliases).',
           f'- Remaining unrated records: **{stats["unrated"]}** (outside the default comparison scope).',
           f'- Eligible in selected scope: **{stats["eligible"]}**.',
           f'- Total attempted: **{len(rows)}**.',
           f'- Total checked (successful comparisons): **{len(checked)}**.',
           f'- Flagged: **{len(flagged)}** (absolute turn or fade delta ≥ 0.5).',
           f'- Unresolved: **{len(unresolved)}**.',
           f'- Speed/glide informational differences: **{len(info)}** (may also be flagged for stability).',
           f'- Manufacturer numbers found without an Atlas baseline: **{len(no_baseline)}**.', '']
    if inputs:
        out += ['Exclusion inputs (read-only): ' + '; '.join('`' + str(p) + '`' for p in inputs) + '.', '']
    if command:
        out += ['Reproduce from repository root:', '', '```powershell', command, '```', '']
    if transport:
        out += [f'HTTP requests this run: {transport.requests}; cache hits: {transport.hits}. Every uncached request, including redirects/searches, is spaced by at least {transport.delay:g} seconds. Cached pages and failures are reused; use a fresh `--cache` directory to refresh.', '']
    out += ['Deltas are **manufacturer minus Atlas**; order is speed/glide/turn/fade. Flagged rows sort by the largest absolute turn/fade delta, then the sum of those deltas. Manufacturer pages are evidence for owner review, including possible catalog lag, approval differences, and plastic/run differences. No ratings are averaged.', '',
            '## Flagged discs', '', '| Brand | Mold | Catalog ID | Atlas S/G/T/F | Manufacturer S/G/T/F | ΔS (info) | ΔG (info) | ΔT | ΔF | Source | Page identity / parser |',
            '|---|---|---|---|---|---:|---:|---:|---:|---|---|']
    for r in flagged:
        d = r['disc']
        out.append('| ' + ' | '.join([escape(d['brand']), escape(d['name']), d['id'], flights([d.get(k) for k in FIELDS]),
                                     flights(r['numbers']), *[fmt(v) for v in r['deltas']], link(r['url']),
                                     escape(r.get('title', '') + ' / ' + r.get('parser', ''))]) + ' |')
    if not flagged:
        out += ['', 'No stability deltas ≥ 0.5 among successfully compared records.']
    out += ['', '## Speed/glide differences (info only)', '', '| Brand | Mold | Atlas S/G/T/F | Manufacturer S/G/T/F | ΔS | ΔG | Source |', '|---|---|---|---|---:|---:|---|']
    for r in sorted(info, key=lambda r: (r['disc']['brand'], r['disc']['name'])):
        d = r['disc']
        out.append('| ' + ' | '.join([escape(d['brand']), escape(d['name']), flights([d.get(k) for k in FIELDS]), flights(r['numbers']), fmt(r['deltas'][0]), fmt(r['deltas'][1]), link(r['url'])]) + ' |')
    out += ['', '## HTTP / JavaScript limits', '', 'Only ordinary HTTP HTML was read. Search snippets, community ratings, and third-party retailer numbers were not used. Missing pages, unreadable flight graphics, blocked fetches/searches, conflicting plastics, identity mismatches, and JS-only content remain manual.', '']
    js = collections.Counter(r['disc']['brand'] for r in unresolved if r.get('js_rendered'))
    out += [('Observed JS-rendered shells: ' + ', '.join(f'{b} ({n} unresolved records)' for b, n in sorted(js.items())) + '.') if js else 'No unresolved pages were positively identified as JS-rendered shells. Other parse failures are not assumed to require JavaScript.', '']
    out += ['## Brand coverage', '', '| Brand | Attempted | Checked | Flagged | Unresolved | No Atlas baseline |', '|---|---:|---:|---:|---:|---:|']
    for brand in sorted({r['disc']['brand'] for r in rows}):
        group = [r for r in rows if r['disc']['brand'] == brand]
        out.append(f'| {escape(brand)} | {len(group)} | {sum(r["status"] == "checked" for r in group)} | {sum(r.get("flagged", False) for r in group)} | {sum(r["status"] == "unresolved" for r in group)} | {sum(r["status"] == "no_baseline" for r in group)} |')
    out += ['', '## Unresolved — manual research', '', 'The linked URL is the last candidate attempted, **not a verified source**. Full URL attempts/reasons and parsed results are in `outputs/manufacturer-diff/results.json`.', '',
            '| Brand | Mold | Catalog ID | Atlas S/G/T/F | Reason | Last candidate |', '|---|---|---|---|---|---|']
    for r in unresolved:
        d = r['disc']
        out.append('| ' + ' | '.join([escape(d['brand']), escape(d['name']), d['id'], flights([d.get(k) for k in FIELDS]), escape(r['reason']), link(r['url'])]) + ' |')
    if no_baseline:
        out += ['', '## Manufacturer numbers without an Atlas baseline', '', '| Brand | Mold | ID | Manufacturer S/G/T/F | Source |', '|---|---|---|---|---|']
        for r in no_baseline:
            d = r['disc']
            out.append('| ' + ' | '.join([escape(d['brand']), escape(d['name']), d['id'], flights(r['numbers']), link(r['url'])]) + ' |')
    out += ['', '## Successfully compared records', '', 'Complete comparison ledger, including matches and differences below the flag threshold.', '',
            '| Brand | Mold | ID | Atlas S/G/T/F | Manufacturer S/G/T/F | ΔT | ΔF | Source |', '|---|---|---|---|---|---:|---:|---|']
    for r in sorted(checked, key=lambda r: (r['disc']['brand'], r['disc']['name'])):
        d = r['disc']
        out.append('| ' + ' | '.join([escape(d['brand']), escape(d['name']), d['id'], flights([d.get(k) for k in FIELDS]), flights(r['numbers']), fmt(r['deltas'][2]), fmt(r['deltas'][3]), link(r['url'])]) + ' |')
    return '\n'.join(out) + '\n'


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--catalog', type=pathlib.Path, default=pathlib.Path('public/data.json'))
    parser.add_argument('--queue', type=pathlib.Path, default=pathlib.Path('docs/stability-review-queue.md'))
    parser.add_argument('--sampling-audit', type=pathlib.Path, default=pathlib.Path('docs/sampling-audit.md'))
    parser.add_argument('--output', type=pathlib.Path, default=pathlib.Path('docs/manufacturer-diff.md'))
    parser.add_argument('--cache', type=pathlib.Path, default=pathlib.Path('outputs/manufacturer-diff'))
    parser.add_argument('--offline', action='store_true')
    parser.add_argument('--include-unrated', action='store_true')
    parser.add_argument('--brand', action='append', help='optional brand filter (repeatable)')
    parser.add_argument('--limit', type=int, help='optional pilot limit; report is labeled partial')
    parser.add_argument('--delay', type=float, default=1.0, help='seconds between requests (minimum 1)')
    parser.add_argument('--timeout', type=float, default=15.0)
    args = parser.parse_args(argv)
    if args.delay < 1 or args.timeout <= 0 or (args.limit is not None and args.limit < 1):
        parser.error('--delay must be >= 1; --timeout and --limit must be positive')
    inputs = [args.queue, args.sampling_audit]
    paths = [args.catalog, *inputs]
    missing = [str(p) for p in paths if not p.is_file()]
    if missing:
        parser.error('missing input(s): ' + ', '.join(missing) + '. Pass --sampling-audit PATH if that research lives in a sibling checkout; it cannot be silently omitted.')
    # Prevent output/cache choices from overwriting research or data inputs.
    protected = {p.resolve() for p in paths} | {pathlib.Path('source-data/verified-model-overrides.json').resolve()}
    if args.output.resolve() in protected or any(args.cache.resolve() == p or args.cache.resolve() in p.parents for p in protected):
        parser.error('output/cache must not overwrite or contain protected inputs')
    original_hashes = {p: hashlib.sha256(p.read_bytes()).hexdigest() for p in protected if p.is_file()}
    discs = json.loads(args.catalog.read_text(encoding='utf-8-sig'))['discs']
    pool, stats = select_discs(discs, [p.read_text(encoding='utf-8-sig') for p in inputs], args.include_unrated)
    if args.brand:
        wanted = {norm(b) for b in args.brand}
        pool = [d for d in pool if norm(d['brand']) in wanted]
    pool.sort(key=lambda d: (d['brand'], base_name(d['name']), d['id']))
    if args.limit:
        pool = pool[:args.limit]
    http = HttpCache(args.cache / 'pages', delay=args.delay, timeout=args.timeout, offline=args.offline)
    resolver = Resolver(http)
    rows = []
    args.output.parent.mkdir(parents=True, exist_ok=True)
    command = 'python scripts/manufacturer-diff.py ' + ' '.join('"' + a.replace('"', '\\"') + '"' if ' ' in a else a for a in (argv if argv is not None else sys.argv[1:]))

    def save(complete):
        results = dict(stats=stats, complete=complete, inputs=[str(p) for p in inputs], results=rows)
        for path, content in [(args.cache / 'results.json', json.dumps(results, indent=2, ensure_ascii=False)),
                              (args.output, render_report(rows, stats, inputs, complete, command, http))]:
            temp = path.with_suffix(path.suffix + '.tmp')
            temp.write_text(content, encoding='utf-8'); temp.replace(path)

    print(f'Catalog {stats["catalog"]}; excluded {stats["excluded"]}; unrated remaining {stats["unrated"]}; eligible {stats["eligible"]}; selected {len(pool)}', flush=True)
    interrupted = False
    try:
        for i, d in enumerate(pool, 1):
            row = resolver.resolve(d)
            rows.append(row)
            label = 'FLAG ' + flights(row['numbers']) if row.get('flagged') else row['status']
            print(f'[{i}/{len(pool)}] {d["brand"]} / {d["name"]}: {label} (HTTP {http.requests}, cache {http.hits})', flush=True)
            if i % 10 == 0:
                save(False)
    except KeyboardInterrupt:
        interrupted = True
        print('Interrupted; saving a partial report. Rerun to reuse the HTTP cache.', flush=True)
    finally:
        complete = not interrupted and not args.brand and args.limit is None and len(rows) == stats['eligible']
        save(complete)
        changed = [str(p) for p, digest in original_hashes.items() if hashlib.sha256(p.read_bytes()).hexdigest() != digest]
        if changed:
            raise RuntimeError('protected input changed during run: ' + ', '.join(changed))
    counts = collections.Counter(r['status'] for r in rows)
    print(f'Saved {args.output}: checked {counts["checked"]}; flagged {sum(r.get("flagged", False) for r in rows)}; unresolved {counts["unresolved"]}; no baseline {counts["no_baseline"]}', flush=True)
    return 130 if interrupted else 0


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    raise SystemExit(main())
