from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from groq import Groq

from .serializers import ConvertRequestSerializer


class ConvertView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ConvertRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        from_lang = serializer.validated_data["from_lang"]
        to_lang   = serializer.validated_data["to_lang"]
        code      = serializer.validated_data["code"]

        api_key = getattr(settings, "GROQ_API_KEY", None)
        if not api_key:
            return Response({"error": "GROQ_API_KEY not set in settings."}, status=503)

        try:
            client = Groq(api_key=api_key)
            chat = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            f"You are an expert code converter. Convert code from {from_lang} to {to_lang}.\n"
                            "- Output ONLY the converted code, no explanation, no markdown, no backticks\n"
                            "- Preserve all logic and comments\n"
                            f"- Use idiomatic {to_lang} patterns"
                        )
                    },
                    {
                        "role": "user",
                        "content": f"Convert this {from_lang} code to {to_lang}:\n\n{code}"
                    }
                ],
                temperature=0.1,
                max_tokens=8000,
            )
            output = chat.choices[0].message.content
            return Response({"output_code": output, "from_lang": from_lang, "to_lang": to_lang})

        except Exception as e:
            return Response({"error": str(e)}, status=500)