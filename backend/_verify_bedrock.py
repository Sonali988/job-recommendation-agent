"""Verify Bedrock connectivity through the backend config + AIClient.
Prints NO secret values — only presence flags and the call result.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

# Load .env the same way the app does
from app.core.config import get_settings  # noqa: E402
from app.clients.ai_client import BedrockAIClient  # noqa: E402

s = get_settings()
print("model_id_set:", bool(s.bedrock_model_id))
print("region:", s.aws_region)

# Presence flags only (never print values)
def present(name: str) -> bool:
    v = os.environ.get(name)
    return bool(v and v.strip())

print("AWS_ACCESS_KEY_ID present:", present("AWS_ACCESS_KEY_ID"))
print("AWS_SECRET_ACCESS_KEY present:", present("AWS_SECRET_ACCESS_KEY"))
print("AWS_SESSION_TOKEN present:", present("AWS_SESSION_TOKEN"))

client = BedrockAIClient(
    model_id=s.bedrock_model_id, region=s.aws_region,
    timeout_s=s.ai_timeout_s, max_tokens=64,
)
print("client_available:", client.is_available())

res = client.generate_text("Reply with the single word: OK", {})
print("call_ok:", res.ok)
if res.ok:
    print("reply_snippet:", (res.text or "")[:60].replace("\n", " "))
else:
    print("error_type:", res.error)
