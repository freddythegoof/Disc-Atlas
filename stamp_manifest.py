"""Discraft-only reviewed stock stamp assignments; shared by prepare and validate."""
from datetime import date
from pathlib import Path, PurePosixPath
from urllib.parse import urlparse
import re

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
        if source.scheme != 'https' or source.netloc != 'www.discraft.com' or source.path in ('','/'):
            raise ValueError('Stamp source must be its official Discraft product page')
        if date.fromisoformat(entry['capturedAt']) < date(2026,10,15):
            raise ValueError('Stamp capture predates permission')
        path = PurePosixPath(entry['asset'])
        if not re.fullmatch(r'stamps/discraft/[a-z0-9-]+\.png',entry['asset']) or str(path) != entry['asset'] or path.is_absolute() or '..' in path.parts:
            raise ValueError('Stamp asset must be a local stamps/discraft PNG')
        asset = Path(public) / str(path)
        if not asset.is_file() or asset.stat().st_size == 0 or not asset.resolve().is_relative_to(Path(public).resolve()):
            raise ValueError('Stamp asset is missing or outside public: ' + entry['asset'])
        assignments[entry['id']] = entry['asset']
    return assignments

def validate_stamp_fields(entries, records, public):
    assignments = validate_stamp_manifest(entries, records, public)
    for d in records:
        if d.get('stampAsset') != assignments.get(d['id']):
            raise ValueError('Catalog stamp field differs from reviewed manifest: ' + d['id'])
    return assignments
