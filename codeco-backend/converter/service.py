"""
Anthropic API integration for code conversion.
Isolated here so views stay thin and this is easy to mock/test.
"""
import anthropic
from django.conf import settings


def convert_code(from_lang: str, to_lang: str, code: str) -> str:
    """
    Call the Anthropic API and return the converted code string.
    Raises anthropic.APIError (or subclasses) on failure.
    """
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    system_prompt = (
        f"You are an expert code converter. Convert code from {from_lang} to {to_lang}.\n"
        "Rules:\n"
        "- Output ONLY the converted code, no explanation, no markdown, no backticks\n"
        "- Preserve all logic and comments\n"
        f"- Use idiomatic {to_lang} patterns and best practices"
    )

    message = client.messages.create(
        model=settings.ANTHROPIC_MODEL,
        max_tokens=settings.ANTHROPIC_MAX_TOKENS,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": f"Convert this {from_lang} code to {to_lang}:\n\n{code}",
            }
        ],
    )

    # Extract plain text from response content blocks
    return "".join(
        block.text for block in message.content if hasattr(block, "text")
    )
