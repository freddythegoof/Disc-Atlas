import importlib.util
import json
import pathlib
import tempfile
import threading
import time
import unittest
from unittest import mock
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SCRIPT = pathlib.Path(__file__).with_name('manufacturer-diff.py')
if not SCRIPT.exists():
    SCRIPT = pathlib.Path(__file__).resolve().parents[1] / 'scripts' / 'manufacturer-diff.py'
spec = importlib.util.spec_from_file_location('manufacturer_diff', SCRIPT)
md = importlib.util.module_from_spec(spec)
spec.loader.exec_module(md)


def disc(name='Volt', brand='MVP', ident='aaaaaaaaaaaa', numbers=(8, 5, -1, 2)):
    return dict(id=ident, name=name, brand=brand, **dict(zip(md.FIELDS, numbers)))


class AuditTests(unittest.TestCase):
    def test_decimal_comma_in_labeled_flight_numbers_is_not_truncated(self):
        row = disc('Cinnamon', 'Clash Discs', numbers=(9, 5, -1.5, 2))
        for fields in ['Speed: 9 Glide: 5 Turn: -1,5 Fade: 2', '9 Speed 5 Glide -1,5 Turn 2 Fade']:
            parsed = md.parse_flights('<h1>Cinnamon</h1><p>' + fields + '</p>', row)
            self.assertEqual(parsed['numbers'], [9, 5, -1.5, 2])
            self.assertFalse(md.compare(row, parsed['numbers'])['flagged'])

    def test_equal_length_catalog_urls_have_deterministic_order(self):
        resolver = md.Resolver(mock.Mock())
        urls = ['https://mvpdiscsports.com/products/volt-aaa',
                'https://mvpdiscsports.com/products/volt-bbb']
        resolver.indices['MVP'] = [(url, 'Volt') for url in urls]
        # A set's traversal order changes with Python's per-process hash seed.
        with mock.patch.object(md, 'set', return_value=list(reversed(urls)), create=True):
            self.assertEqual(resolver.catalog_links(disc()), urls)

    def test_atomic_save_retries_transient_windows_file_lock(self):
        with tempfile.TemporaryDirectory(dir=SCRIPT.parent) as directory:
            path = pathlib.Path(directory) / 'report.md'
            path.write_text('old', encoding='utf-8')
            original_replace = pathlib.Path.replace
            attempts = []

            def locked_once(source, target):
                attempts.append(target)
                if len(attempts) == 1:
                    raise PermissionError('Windows reader temporarily prevents replacement')
                return original_replace(source, target)

            with mock.patch.object(pathlib.Path, 'replace', locked_once), mock.patch.object(md.time, 'sleep') as sleep:
                md.atomic_write(path, 'complete report')
            self.assertEqual(path.read_text(encoding='utf-8'), 'complete report')
            self.assertEqual(len(attempts), 2)
            sleep.assert_called_once()

    def test_atomic_save_does_not_hide_persistent_permission_error(self):
        with tempfile.TemporaryDirectory(dir=SCRIPT.parent) as directory:
            path = pathlib.Path(directory) / 'report.md'
            path.write_text('old', encoding='utf-8')
            with mock.patch.object(pathlib.Path, 'replace', side_effect=PermissionError('locked')), mock.patch.object(md.time, 'sleep'):
                with self.assertRaises(PermissionError):
                    md.atomic_write(path, 'new')
            self.assertEqual(path.read_text(encoding='utf-8'), 'old')

    def test_excludes_ids_heading_aliases_and_sample_table_without_cross_brand_leaks(self):
        rows = [disc(), disc('Volt (old)', ident='bbbbbbbbbbbb'),
                disc('Volt', 'Other', 'cccccccccccc'),
                disc('Tui (PA1)', 'RPM', 'dddddddddddd'),
                disc('FD (new)', 'Discmania', 'eeeeeeeeeeee')]
        docs = ['## Volt — MVP (id aaaaaaaaaaaa)\n## FD — Discmania\n',
                '| # | Disc | Brand | Atlas S/G/T/F | Stratum | Atlas row source |\n'
                '|---|---|---|---|---|---|\n'
                '| 13 | Tui (PA1) | RPM | 3/4/-1/0.5 | putter / stable | Infinite |']
        selected, stats = md.select_discs(rows, docs)
        self.assertEqual([d['id'] for d in selected], ['cccccccccccc'])
        self.assertEqual(stats['excluded'], 4)

    def test_unrated_scope_is_explicit(self):
        rows = [disc(), disc('Unrated', ident='bbbbbbbbbbbb', numbers=(None,) * 4)]
        self.assertEqual(len(md.select_discs(rows, [])[0]), 1)
        self.assertEqual(len(md.select_discs(rows, [], include_unrated=True)[0]), 2)

    def test_excludes_explicit_linked_atlas_references_without_confusing_plastic_names(self):
        rows = [disc('P2x', 'Discmania'), disc('Cosmic', 'Alfa Discs', 'bbbbbbbbbbbb')]
        text = '- **Linked:** P2x (Atlas 2/3/0/1, same numbers), other covered anchors.\n- Plastic variance: Cosmic is glidier.'
        self.assertEqual([d['name'] for d in md.select_discs(rows, [text])[0]], ['Cosmic'])

    def test_innova_badges_are_not_navigation_or_related_product_ratings(self):
        page = '<title>Leopard - Innova</title><nav>Speed 14 Glide 4 Turn 0 Fade 4</nav><header class="entry-header"><h1>Leopard</h1></header>'
        for k, v in zip(md.FIELDS, [6, 5, -2, 1]):
            page += f'<div class="button rating-{k}"><span class="flight-ratings">{v}</span><span>{k}</span></div>'
        self.assertEqual(md.parse_flights(page, disc('Leopard', 'Innova'))['numbers'], [6, 5, -2, 1])

    def test_kastaplast_collection_heading_and_daredevil_title_ratings(self):
        page = '<h1>Collection: Falk</h1><div class="collection-hero__description"><h2>FAIRWAY DRIVER 9 | 6 | -2 | 1</h2><p>Falk is a fairway driver.</p></div>'
        self.assertEqual(md.parse_flights(page, disc('Falk', 'Kastaplast'))['numbers'], [9, 6, -2, 1])
        page = '<h1>Wolverine (171-176 grams) 9,5,-2,2</h1><p>The Wolverine disc.</p>'
        self.assertEqual(md.parse_flights(page, disc('Wolverine', 'Daredevil Discs'))['numbers'], [9, 5, -2, 2])

    def test_lone_star_exact_title_numbers_and_dga_model_collection_badges(self):
        page = '<h1>Armadillo 1/2/0/1</h1><div class="product-description">Flight Numbers 1 / 2 / 0 / 1</div>'
        self.assertEqual(md.parse_flights(page, disc('Armadillo', 'Lone Star Discs'))['numbers'], [1, 2, 0, 1])
        page = '<h1>Witness</h1><div class="flight-numbers">8 Speed 6 Glide -3 Turn 1 Fade</div><div class="product-grid">9 Speed 5 Glide -2 Turn 2 Fade</div>'
        self.assertEqual(md.parse_flights(page, disc('Witness', 'Dynamic Discs'))['numbers'], [8, 6, -3, 1])
        page = '<h1>Atmos Surf Putt &amp; Approach</h1><div class="product-description">Flight Numbers: 3 | 4 | 0 | 1</div>'
        self.assertEqual(md.parse_flights(page, disc('Surf', 'DGA'))['numbers'], [3, 4, 0, 1])

    def test_product_discovery_deduplicates_color_variants(self):
        page = '<a href="https://mintdiscs.com/collections/lobster/products/lobster-sublime-plastic?variant=1">Lobster</a><a href="https://mintdiscs.com/products/lobster-sublime-plastic?variant=2">Lobster</a>'
        self.assertEqual(md.search_urls(page, disc('Lobster', 'Mint Discs')), ['https://mintdiscs.com/products/lobster-sublime-plastic'])

    def test_resolver_follows_collection_products_without_web_search(self):
        import hashlib
        with tempfile.TemporaryDirectory(dir=SCRIPT.parent) as tmp:
            cache = md.HttpCache(pathlib.Path(tmp), offline=True)
            pages = {
                'https://mintdiscs.com/collections/lobster': '<h1>Lobster</h1><div class="product-grid"><a href="/products/lobster-sublime-plastic">Lobster - Sublime Plastic</a></div>',
                'https://mintdiscs.com/products/lobster-sublime-plastic': '<h1>Lobster - Sublime Plastic</h1><div class="product-description">Lobster Speed 5 / Glide 5 / Turn -3 / Fade 1</div>',
            }
            for url, page in pages.items():
                (cache.directory / (hashlib.sha256(url.encode()).hexdigest() + '.json')).write_text(json.dumps(dict(url=url, final_url=url, status=200, html=page, error=None)), encoding='utf-8')
            result = md.Resolver(cache).resolve(disc('Lobster', 'Mint Discs', numbers=(5, 5, -2, 1)))
            self.assertEqual(result['status'], 'checked')
            self.assertEqual(result['deltas'][2], -1)
            self.assertEqual(result['url'], 'https://mintdiscs.com/products/lobster-sublime-plastic')

    def test_catalog_discovers_molds_on_later_pages(self):
        import hashlib
        with tempfile.TemporaryDirectory(dir=SCRIPT.parent) as tmp:
            cache = md.HttpCache(pathlib.Path(tmp), offline=True)
            pages = {
                'https://lonestardiscs.com/collections/all': '<h1>Products</h1><a rel="next" href="/collections/all?page=2">Next</a>',
                'https://lonestardiscs.com/collections/all?page=2': '<h1>Products</h1><a href="/products/lone-wolf-distance-driver?variant=123">Lone Wolf 13/5/-3/1</a>',
            }
            for url, page in pages.items():
                (cache.directory / (hashlib.sha256(url.encode()).hexdigest() + '.json')).write_text(json.dumps(dict(url=url, final_url=url, status=200, html=page, error=None)), encoding='utf-8')
            self.assertIn('https://lonestardiscs.com/products/lone-wolf-distance-driver', md.Resolver(cache).catalog_links(disc('Lone Wolf', 'Lone Star Discs')))

    def test_mvp_superscripts_preserve_negative_half_point(self):
        page = '<h1>Volt</h1><div class="power-meter"><div><span>8</span></div><div><span>5</span></div><div><span>-0</span><sup>.5</sup></div><div><span>2</span></div></div>'
        self.assertEqual(md.parse_flights(page, disc())['numbers'], [8, 5, -0.5, 2])

    def test_discraft_unordered_badges_ignore_fifth_stability_and_similar_discs(self):
        page = '<h1>APX</h1>'
        for n, label in [(2, 'SPEED'), (-1, 'TURN'), (0, 'STABILITY'), (2, 'GLIDE'), (1, 'FADE')]:
            page += f'<div><h1>{n}</h1><p>{label}</p></div>'
        page += '<h2>SIMILAR DISCS</h2><div>4 SPEED 3 GLIDE 0 TURN 3 FADE</div>'
        self.assertEqual(md.parse_flights(page, disc('APX', 'Discraft'))['numbers'], [2, 2, -1, 1])

    def test_infinite_own_brand_uses_manufacturer_header_not_reviewer_averages(self):
        page = '<h1>Infinite Discs Alpaca</h1><div>Manufacturer Flight Numbers 3/3/0/1 Reviewer Flight Numbers 2.9/3.1/0/1.1</div><h1>Related Products</h1><div>Manufacturer Flight Numbers 4/3/0/3</div>'
        self.assertEqual(md.parse_flights(page, disc('Alpaca', 'Infinite Discs'))['numbers'], [3, 3, 0, 1])

    def test_discmania_collection_baseline_ignores_product_variants(self):
        page = '<h1>FD</h1><ul class="flight-numbers collection-numbers">'
        page += ''.join(f'<li>{v}<span>{k}</span></li>' for k, v in zip(md.FIELDS, [7, 6, 0, 1])) + '</ul>'
        page += '<div class="product-card">S-Line FD 7 Speed 7 Glide 0 Turn 1 Fade</div>'
        self.assertEqual(md.parse_flights(page, disc('FD', 'Discmania'))['numbers'], [7, 6, 0, 1])

    def test_labeled_description_and_unicode_minus(self):
        page = '<h1>River</h1><div class="collection__description">Speed: 7 | Glide: 7 | Turn: −1 | Fade: 1</div>'
        self.assertEqual(md.parse_flights(page, disc('River', 'Latitude 64'))['numbers'], [7, 7, -1, 1])

    def test_explicit_rating_header_in_primary_description(self):
        page = '<h1>AGL Discs - Sherbet Alpine Elm (Stock Stamp)</h1><div class="product__description">Elm is a fairway driver. Flight Ratings: 9 | 4 | 0 | 3 Plastic Blend: Alpine</div>'
        self.assertEqual(md.parse_flights(page, disc('Elm', 'Above Ground Level'))['numbers'], [9, 4, 0, 3])

    def test_slash_fallback_needs_mold_nearby_and_valid_ranges(self):
        page = '<h1>Example</h1><div class="product-description">Example flight numbers: 9/5/-1.5/2.</div>'
        self.assertEqual(md.parse_flights(page, disc('Example', 'Other'))['numbers'], [9, 5, -1.5, 2])
        self.assertIsNone(md.parse_flights('<h1>Example</h1><p>99/88/77/66</p>', disc('Example', 'Other'))['numbers'])

    def test_rejects_wrong_mold_short_name_collision_and_js_shell(self):
        for page, row in [('<h1>Zone OS</h1><p>Zone OS 4/2/0/5</p>', disc('Zone', 'Discraft')),
                          ('<h1>Leopard3</h1><p>Leopard3 7/5/-2/1</p>', disc('Leopard', 'Innova')),
                          ('<script>window.data={"flight": "8/5/-1/2"}</script>', disc())]:
            self.assertIsNone(md.parse_flights(page, row)['numbers'])

    def test_conflicting_plastic_numbers_stay_manual(self):
        page = '<h1>Example</h1><div class="product-description">Example Premium 9/5/-1/2. Example Base 9/5/-2/1.</div>'
        result = md.parse_flights(page, disc('Example', 'Other'))
        self.assertIsNone(result['numbers'])
        self.assertIn('conflict', result['reason'])

    def test_does_not_take_recommendation_numbers(self):
        page = '<h1>Example</h1><div class="product-description">Example is discontinued.</div><section class="product-recommendations"><h2>Example Junior</h2>Speed 3 Glide 4 Turn -2 Fade 0</section>'
        self.assertIsNone(md.parse_flights(page, disc('Example', 'Other'))['numbers'])

    def test_threshold_is_inclusive_and_speed_glide_are_info(self):
        result = md.compare(disc(), [9, 6, -0.5, 2])
        self.assertTrue(result['flagged'])
        self.assertEqual(result['deltas'], [1, 1, 0.5, 0])
        self.assertFalse(md.compare(disc(), [10, 7, -1, 2])['flagged'])

    def test_search_unwraps_bing_and_rejects_retailers_and_other_molds(self):
        import base64
        u = 'https://mintdiscs.com/products/lobster-sublime-plastic'
        enc = base64.urlsafe_b64encode(u.encode()).decode().rstrip('=')
        page = f'<h2><a href="https://www.bing.com/ck/a?u=a1{enc}">Lobster</a></h2>'
        page += '<h2><a href="https://infinitediscs.com/mint-lobster">Lobster</a></h2>'
        page += '<h2><a href="https://mintdiscs.com/products/lasso">Lasso</a></h2>'
        self.assertEqual(md.search_urls(page, disc('Lobster', 'Mint Discs')), [u])
        self.assertFalse(md.is_official('https://mintdiscs.com.evil.test/products/lobster', 'Mint Discs'))

    def test_report_sorts_by_stability_delta_and_counts_unresolved(self):
        rows = []
        for name, actual in [('Small', [8, 5, -0.5, 2]), ('Large', [8, 5, 1, 2]), ('Info', [9, 5, -1, 2])]:
            d = disc(name)
            rows.append(dict(disc=d, status='checked', url='https://mvpdiscsports.com/discs/' + name.lower(), **md.compare(d, actual)))
        rows.append(dict(disc=disc('Missing'), status='unresolved', reason='parse failed', url=''))
        report = md.render_report(rows, dict(catalog=4, excluded=0, unrated=0, eligible=4), [], complete=True)
        self.assertLess(report.index('| MVP | Large |'), report.index('| MVP | Small |'))
        self.assertIn('Total checked (successful comparisons): **3**', report)
        self.assertIn('Unresolved: **1**', report)
        self.assertIn('Info', report)

    def test_resolver_compares_a_cached_official_page_and_main_preserves_inputs(self):
        import hashlib
        with tempfile.TemporaryDirectory(dir=SCRIPT.parent) as tmp:
            root = pathlib.Path(tmp)
            cache = md.HttpCache(root / 'cache' / 'pages', offline=True)
            url = 'https://mvpdiscsports.com/discs/volt/'
            page = '<h1>Volt</h1><div class="power-meter"><div><span>8</span></div><div><span>5</span></div><div><span>-0</span><sup>.5</sup></div><div><span>2</span></div></div>'
            (cache.directory / (hashlib.sha256(url.encode()).hexdigest() + '.json')).write_text(json.dumps(dict(url=url, final_url=url, status=200, html=page, error=None)), encoding='utf-8')
            result = md.Resolver(cache).resolve(disc())
            self.assertTrue(result['flagged'])
            catalog = root / 'data.json'; catalog.write_text(json.dumps({'discs': [disc()]}), encoding='utf-8')
            queue = root / 'queue.md'; queue.write_text('# Empty queue', encoding='utf-8')
            audit = root / 'audit.md'; audit.write_text('# Empty audit', encoding='utf-8')
            snapshots = [p.read_bytes() for p in [catalog, queue, audit]]
            code = md.main(['--catalog', str(catalog), '--queue', str(queue), '--sampling-audit', str(audit), '--cache', str(root / 'cache'), '--output', str(root / 'report.md'), '--offline'])
            self.assertEqual(code, 0)
            self.assertEqual([p.read_bytes() for p in [catalog, queue, audit]], snapshots)
            self.assertIn('Flagged: **1**', (root / 'report.md').read_text(encoding='utf-8'))

    def test_http_cache_preserves_pages_failures_redirects_and_rate_limit(self):
        starts = []
        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                starts.append(time.monotonic())
                if self.path == '/redirect':
                    self.send_response(302); self.send_header('Location', '/ok'); self.end_headers(); return
                self.send_response(404 if self.path == '/missing' else 200)
                self.end_headers(); self.wfile.write(b'<h1>Example</h1>')
            def log_message(self, *args):
                pass
        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
        try:
            with tempfile.TemporaryDirectory(dir=SCRIPT.parent) as tmp:
                cache = md.HttpCache(pathlib.Path(tmp), delay=0.05)
                root = f'http://127.0.0.1:{server.server_port}'
                self.assertEqual(cache.get(root + '/redirect')['final_url'], root + '/ok')
                self.assertEqual(cache.get(root + '/missing')['status'], 404)
                n = len(starts)
                self.assertEqual(cache.get(root + '/redirect')['html'], '<h1>Example</h1>')
                self.assertEqual(cache.get(root + '/missing')['status'], 404)
                self.assertEqual(len(starts), n)
                self.assertTrue(all(b-a >= 0.045 for a, b in zip(starts, starts[1:])))
                offline = md.HttpCache(pathlib.Path(tmp), offline=True)
                self.assertEqual(offline.get(root + '/missing')['status'], 404)
                self.assertIn('offline', offline.get(root + '/uncached')['error'])
        finally:
            server.shutdown(); server.server_close(); thread.join()


if __name__ == '__main__':
    unittest.main()
