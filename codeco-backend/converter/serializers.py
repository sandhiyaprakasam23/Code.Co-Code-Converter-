from rest_framework import serializers
from .models import ConversionHistory

SUPPORTED_LANGS = [
    "Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#",
    "Go", "Rust", "Swift", "Kotlin", "Ruby", "PHP", "Scala", "R",
    "MATLAB", "Perl", "Haskell", "Lua", "Dart", "Elixir", "Clojure",
    "F#", "Groovy", "Julia", "COBOL", "Fortran", "Assembly", "SQL", "Bash",
]


class ConvertRequestSerializer(serializers.Serializer):
    from_lang = serializers.ChoiceField(choices=SUPPORTED_LANGS)
    to_lang   = serializers.ChoiceField(choices=SUPPORTED_LANGS)
    code      = serializers.CharField(min_length=1, max_length=100_000)

    def validate(self, data):
        if data["from_lang"] == data["to_lang"]:
            raise serializers.ValidationError(
                "from_lang and to_lang must be different languages."
            )
        return data


class ConversionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = ConversionHistory
        fields = (
            "id", "from_lang", "to_lang", "input_code",
            "output_code", "char_count", "success", "error_msg", "created_at",
        )
        read_only_fields = fields
