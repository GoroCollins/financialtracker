from rest_framework import serializers
from ..models import Currency, ExchangeRate
from decimal import Decimal
from django.core.validators import MinValueValidator

class CurrencySerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')
    modified_by = serializers.SerializerMethodField()

    class Meta:
        model = Currency
        fields = ['code', 'description', 'is_local', 'created_by', 'created_at', 'modified_by', 'modified_at']

    def get_modified_by(self, obj):
        """Ensure modified_by remains NULL on creation and is only set on update."""
        return obj.modified_by.username if obj.modified_by else None

    def validate(self, data):
        """Ensure only one local currency exists and validate foreign currency logic."""
        is_local = data.get("is_local", self.instance.is_local if self.instance else False)
        if is_local:
            if Currency.objects.filter(is_local=True).exclude(pk=self.instance.pk if self.instance else None).exists():
                raise serializers.ValidationError("Only one local currency can exist.")
        elif not Currency.objects.filter(is_local=True).exists():
            raise serializers.ValidationError("Cannot set this currency as foreign; no local currency exists.")
        return data
    
    def create(self, validated_data):
        """Set created_by and optionally modified_by on creation."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
            validated_data["modified_by"] = None # Ensure modified_by is NULL on creation

        return super().create(validated_data)


    def update(self, instance, validated_data):
        """Set modified_by when updating."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['modified_by'] = request.user
        return super().update(instance, validated_data)

class ExchangeRateSerializer(serializers.ModelSerializer):
    currency_description = serializers.CharField(
        source="currency.description", read_only=True
    )
    created_by = serializers.ReadOnlyField(source='created_by.username')
    modified_by = serializers.SerializerMethodField()
    currency_is_local = serializers.BooleanField(source='currency.is_local', read_only=True)
    rate = serializers.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.1"), message="Rate must be at least 0.1.")]
    )
    
    class Meta:
        model = ExchangeRate
        fields = [
            "id", "currency", "currency_description", "rate", "is_current", "created_by",
            "created_at", "modified_by", "modified_at", "currency_is_local",
        ]
        read_only_fields = ["created_at", "modified_at"]
    
    def get_modified_by(self, obj):
        """Ensure modified_by remains NULL on creation and is only set on update."""
        return obj.modified_by.username if obj.modified_by else None

    def validate_currency(self, value):
        """Ensure the selected currency is not the local currency."""
        if value.is_local:
            raise serializers.ValidationError("Exchange rates cannot be assigned to a local currency.")
        return value

    def validate_rate(self, value):
        """Ensure exchange rate is within a reasonable range."""
        if value < Decimal("0.1"):
            raise serializers.ValidationError("Rate must be at least 0.1")
        return value

    def create(self, validated_data):
        """Assign the created_by user and create the exchange rate."""
        request = self.context.get("request", None)
        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user
            validated_data["modified_by"] = None
        else:
            raise serializers.ValidationError({"created_by": "User must be authenticated."})

        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Ensure modified_by is set when updating an exchange rate."""
        request = self.context.get("request", None)

        if request and request.user.is_authenticated:
            validated_data["modified_by"] = request.user
        else:
            raise serializers.ValidationError({"modified_by": "User must be authenticated to modify this record."})

        return super().update(instance, validated_data)