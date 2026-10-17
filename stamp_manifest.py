"""Discraft-only reviewed stock stamp assignments; shared by prepare and validate."""
from datetime import date
from pathlib import Path, PurePosixPath
from urllib.parse import urlparse
import re
import math

RIGHTS = 'Discraft permission, 2026-10-15, free resource'

def validate_stamp_manifest(entries, records, public):
    if not isinstance(entries, list):
        raise ValueError('Stamp manifest must be a list')
    catalog = {d['id']: d for d in records}
    assignments = {}
    for entry in entries:
        required = ('id','brand','mold','asset','sourceURL','capturedAt','rightsBasis')
        if not isinstance(entry, dict) or any(not isinstance(entry.get(k), str) or not entry[k].strip() for k in required):
            raise ValueError('Stamp entry needs identity, asset, source, capture date and rights basis')
        d = catalog.get(entry['id'])
        if not d or entry['brand'] != 'Discraft' or d['brand'] != 'Discraft':
            raise ValueError('Stamp assets are permitted on Discraft records only')
        if entry['mold'] != d.get('catalogName', d['name']):
            raise ValueError('Stamp mold does not match its catalog record')
        if entry['id'] in assignments:
            raise ValueError('Duplicate stamp assignment')
        if entry['rightsBasis'] != RIGHTS:
            raise ValueError('Stamp rights basis must retain the Discraft free resource condition')
        source = urlparse(entry['sourceURL'])
        official = source.netloc == 'www.discraft.com' and source.path not in ('','/')
        infinite = source.netloc == 'infinitediscs.com' and re.fullmatch(r'/discraft-[a-z0-9-]+/esp', source.path)
        if source.scheme != 'https' or not (official or infinite):
            raise ValueError('Stamp source must be an official Discraft or reviewed Infinite Discraft ESP product page')
        if date.fromisoformat(entry['capturedAt']) < date(2026,10,15):
            raise ValueError('Stamp capture predates permission')
        path = PurePosixPath(entry['asset'])
        if not re.fullmatch(r'stamps/discraft/[a-z0-9-]+\.png',entry['asset']) or str(path) != entry['asset'] or path.is_absolute() or '..' in path.parts:
            raise ValueError('Stamp asset must be a local stamps/discraft PNG')
        asset = Path(public) / str(path)
        if not asset.is_file() or asset.stat().st_size == 0 or not asset.resolve().is_relative_to(Path(public).resolve()):
            raise ValueError('Stamp asset is missing or outside public: ' + entry['asset'])
        placement = entry.get('placement')
        if not isinstance(placement, dict) or any(type(placement.get(k)) not in (int,float) or not math.isfinite(placement[k]) or not 0 < placement[k] <= 1 for k in ('diameterFraction','assetInkFraction')):
            raise ValueError('Stamp placement needs full-disc diameter and asset ink fractions in (0, 1]')
        if placement['diameterFraction'] > placement['assetInkFraction']:
            raise ValueError('Stamp texture would exceed the full disc diameter')
        assignments[entry['id']] = entry['asset']
    return assignments

def validate_stamp_fields(entries, records, public):
    assignments = validate_stamp_manifest(entries, records, public)
    placements = {e['id']: e['placement'] for e in entries}
    for d in records:
        if d.get('stampPlacement') != placements.get(d['id']):
            raise ValueError('Catalog stamp placement differs from reviewed manifest: ' + d['id'])
        if d.get('stampAsset') != assignments.get(d['id']):
            raise ValueError('Catalog stamp field differs from reviewed manifest: ' + d['id'])
    return assignments
