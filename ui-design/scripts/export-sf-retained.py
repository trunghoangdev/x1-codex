"""Run via SSH stdin on linux3. Read-only allowlist export of one retained SF attempt.
Never emits raw payloads, diagnostic streams, objectives, credentials or host paths.
"""
import base64
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

assignment_path = Path('/home/trungh/w10/assignment.json')
attempt_root = Path('/home/trungh/w10-retention/attempts/20260913T153424Z-eb63b7bd05303482')
assignment = json.loads(assignment_path.read_text())
attempt = json.loads((attempt_root / 'attempt.json').read_text())
product = json.loads((attempt_root / 'candidate/work-product.json').read_text())
assert assignment['id'] == attempt['assignment_id']
assert assignment['output_scope'] == attempt['output_scope']
assert assignment['expected_payload_type_tag'] == attempt['expected_payload_type_tag']
assert attempt['artifact_digest'] == product['artifact_digest']
assert attempt['expected_payload_type_tag'] == product['payload_type_tag']
raw = base64.urlsafe_b64decode(product['bytes_base64url'] + '=' * ((-len(product['bytes_base64url'])) % 4))
blob_matches = 'sha256:' + hashlib.sha256(raw).hexdigest() == product['blob_digest']
body = {'schema_id': product['payload_schema_id'], 'schema_version': product['payload_schema_version'], 'payload_type_tag': product['payload_type_tag'], 'blob_digest': product['blob_digest']}
canonical = json.dumps(body, sort_keys=True, separators=(',', ':')).encode()
content_matches = 'sha256:' + hashlib.sha256(b'forge.typed-payload.v1\0' + canonical).hexdigest() == product['content_digest']
assert blob_matches and content_matches

def pick(value, keys):
    return {key: value[key] for key in keys if key in value}

print(json.dumps({
    'format': 'sf-inspection-redacted', 'version': 1,
    'source': {
        'kind': 'retained-redacted',
        'label': 'Software Factory work item 10 · retained execution metadata',
        'observed_at': datetime.now(timezone.utc).isoformat(),
        'revision': attempt['attempt_id'],
        'capture_method': 'Read-only allowlist export of SF assignment, retained attempt and work-product envelope',
        'freshness': 'Historical retained records; not a live runtime observation',
    },
    'assignment': pick(assignment, ['id','work_id','base_revision','output_scope','required_effect_paths','expected_payload_type_tag']),
    'attempts': [pick(attempt, ['schema_version','attempt_id','assignment_id','opened_at','settled_at','outcome','output_scope','expected_payload_type_tag','attempt_digest','artifact_digest','state','termination','exit_code','ephemeral_cleanup'])],
    'work_products': [pick(product, ['artifact_digest','content_digest','payload_schema_id','payload_schema_version','payload_type_tag','blob_digest'])],
    'redactions': {
        'assignment': ['objective_file','source_repository','working_context','validator','publication_criterion','execution_material'],
        'attempt': ['objective','work_request_digest','diagnostics'],
        'work_product': ['bytes_base64url','referenced file bodies'],
    },
    'integrity_checks': {
        'checked_by': 'Read-only export script against source bytes before omission',
        'blob_bytes_match': blob_matches,
        'typed_payload_body_match': content_matches,
        'artifact_provenance': 'Not independently verified',
    },
}, indent=2))
