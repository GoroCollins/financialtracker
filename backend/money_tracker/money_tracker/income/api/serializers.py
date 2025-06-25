from rest_framework import serializers
from ..models import EarnedIncome, PortfolioIncome, PassiveIncome

class BaseIncomeSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')
    modified_by = serializers.SerializerMethodField()
    amount_lcy_display = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%b %d, %Y %I:%M %p", read_only=True)
    modified_at = serializers.DateTimeField(format="%b %d, %Y %I:%M %p", read_only=True)

    class Meta:
        fields = [
            'income_name', 'currency', 'amount', 'amount_lcy_display', 'notes', 
            'created_by', 'created_at', 'modified_by', 'modified_at', 'id'
        ]
        read_only_fields = [ 'created_by', 'created_at', 'modified_by', 'modified_at', 'id']
    
    def get_modified_by(self, obj):
        """Ensure modified_by remains NULL on creation and is only set on update."""
        return obj.modified_by.username if obj.modified_by else None
    
    def get_amount_lcy_display(self, obj):
        # Format the amount_lcy as {local_currency_code} {amount_lcy}
        if obj.currency and obj.amount_lcy is not None:
            return f"{obj.currency.code} {obj.amount_lcy:.2f}"
        return None

    def validate(self, data):
        """Ensure amount is non-negative and authentication is enforced."""
        request = self.context.get("request")
        errors = {}

        if not request or not request.user or not request.user.is_authenticated:
            if self.instance:  # If an instance exists, it's an update
                errors["modified_by"] = "User must be authenticated to modify this record."
            else:  # Otherwise, it's a create operation
                errors["created_by"] = "User must be authenticated."

        amount = data.get("amount")
        if amount is not None and amount < 0:
            errors["amount"] = "Amount must be non-negative."

        if errors:
            raise serializers.ValidationError(errors)

        return data
        
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
class EarnedIncomeSerializer(BaseIncomeSerializer):
    class Meta(BaseIncomeSerializer.Meta):
        model = EarnedIncome


class PortfolioIncomeSerializer(BaseIncomeSerializer):
    class Meta(BaseIncomeSerializer.Meta):
        model = PortfolioIncome


class PassiveIncomeSerializer(BaseIncomeSerializer):
    class Meta(BaseIncomeSerializer.Meta):
        model = PassiveIncome
