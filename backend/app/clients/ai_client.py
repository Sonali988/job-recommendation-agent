"""LC-4 AIClient protocol + BedrockAIClient.

BedrockAIClient wraps boto3 bedrock-runtime with an explicit timeout, one bounded
retry on transient errors, strict-JSON parsing, and token guardrails. Credentials
come from the standard AWS credential chain (env/profile) — never hardcoded
(US-10.1, SECURITY-12). Returns AIResult so callers can fall back on failure.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Optional, Protocol

from app.core.logging import get_logger, log_event

_logger = get_logger("ai_client")


@dataclass
class AIResult:
    raw: str = ""
    parsed: Optional[dict] = None
    ok: bool = False
    text: str = ""
    error: str = field(default="", repr=False)


class AIClient(Protocol):
    def generate_json(self, prompt: str, context: dict) -> AIResult: ...
    def generate_text(self, prompt: str, context: dict) -> AIResult: ...
    def is_available(self) -> bool: ...


def _extract_json(text: str) -> Optional[dict]:
    """Best-effort strict-ish JSON extraction from a model response."""
    text = text.strip()
    try:
        obj = json.loads(text)
        return obj if isinstance(obj, dict) else {"items": obj}
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                return None
    return None


class BedrockAIClient:
    """Real Bedrock client. Falls back gracefully if boto3/AWS is unavailable."""

    def __init__(self, model_id: str, region: str, timeout_s: float, max_tokens: int):
        self.model_id = model_id
        self.region = region
        self.timeout_s = timeout_s
        self.max_tokens = max_tokens
        self._client = None
        self._init_error = ""
        self._init_client()

    def _init_client(self) -> None:
        try:
            import boto3
            from botocore.config import Config

            cfg = Config(
                region_name=self.region,
                connect_timeout=self.timeout_s,
                read_timeout=self.timeout_s,
                retries={"max_attempts": 1},  # we do our own bounded retry
            )
            self._client = boto3.client("bedrock-runtime", config=cfg)
        except Exception as exc:  # noqa: BLE001 - degrade if no AWS/boto3
            self._init_error = str(exc)
            self._client = None
            log_event(_logger, "bedrock_init_unavailable")

    def is_available(self) -> bool:
        return self._client is not None

    def _invoke(self, prompt: str, context: dict) -> AIResult:
        # Uses the Bedrock Converse API, which normalizes request/response across
        # model families (Amazon Nova, Anthropic Claude, Meta Llama, etc.), so the
        # same code works regardless of the configured BEDROCK_MODEL_ID.
        if self._client is None:
            return AIResult(ok=False, error="bedrock_unavailable")
        user_text = prompt + "\n\nContext:\n" + json.dumps(context, ensure_ascii=False)
        messages = [{"role": "user", "content": [{"text": user_text}]}]
        inference_config = {"maxTokens": self.max_tokens, "temperature": 0.2}

        last_error = ""
        for attempt in range(2):  # one bounded retry (RP-2)
            try:
                resp = self._client.converse(
                    modelId=self.model_id,
                    messages=messages,
                    inferenceConfig=inference_config,
                )
                blocks = resp.get("output", {}).get("message", {}).get("content", [])
                text = "".join(b.get("text", "") for b in blocks if isinstance(b, dict))
                return AIResult(raw=text, text=text, ok=True)
            except Exception as exc:  # noqa: BLE001
                last_error = type(exc).__name__
                log_event(_logger, "bedrock_invoke_error", attempt=attempt, error_type=last_error)
        return AIResult(ok=False, error=last_error)

    def generate_text(self, prompt: str, context: dict) -> AIResult:
        return self._invoke(prompt, context)

    def generate_json(self, prompt: str, context: dict) -> AIResult:
        result = self._invoke(prompt + "\n\nRespond with strict JSON only.", context)
        if not result.ok:
            return result
        parsed = _extract_json(result.text)
        if parsed is None:
            return AIResult(raw=result.text, ok=False, error="json_parse_failed")
        result.parsed = parsed
        return result
