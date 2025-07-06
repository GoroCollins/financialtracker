from rest_framework import serializers
from ..models import Loan, InterestType
from money_tracker.currencies.models import Currency, ExchangeRate
from django.core.exceptions import ValidationError as DjangoValidationError


class InterestTypeSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')
    created_at = serializers.DateTimeField(format="%b %d, %Y %I:%M %p", read_only=True)
    modified_by = serializers.SerializerMethodField()
    modified_at = serializers.DateTimeField(format="%b %d, %Y %I:%M %p", read_only=True)
    class Meta:
        model = InterestType
        fields = ['code', 'description', 'modified_by', 'created_by', 'created_at', 'modified_at']
        
    def get_modified_by(self, obj):
        """Ensure modified_by remains NULL on creation and is only set on update."""
        return obj.modified_by.username if obj.modified_by else None

    def validate_code(self, value):
        """Ensure the code is always uppercase."""
        return value.upper()

    def create(self, validated_data):
        """Set created_by from the request user and ensure the code is uppercase."""
        request = self.context.get("request", None)
        if request and request.user.is_authenticated:
            validated_data["created_by"] = request.user
            validated_data['modified_by'] = None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Ensure modified_by is set when updating an interest type."""
        request = self.context.get("request", None)
        if request and request.user.is_authenticated:
            validated_data["modified_by"] = request.user
        return super().update(instance, validated_data)
    
class LoanSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')
    # created_by = serializers.PrimaryKeyRelatedField(read_only=True)  # Accepts user ID but does not allow editing
    amount_taken_lcy_display = serializers.SerializerMethodField()
    interest_lcy_display = serializers.SerializerMethodField()
    amount_repay_lcy_display = serializers.SerializerMethodField()
    amount_paid_lcy_display = serializers.SerializerMethodField()
    due_balance_lcy_display = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%b %d, %Y %I:%M %p", read_only=True)
    modified_at = serializers.DateTimeField(format="%b %d, %Y %I:%M %p", read_only=True)
    modified_by = serializers.SerializerMethodField()
    class Meta:
        model = Loan
        fields = [
            'id', 'source', 'loan_date','currency', 'amount_taken', 'reason', 'interest_type', 'compound_frequency', 'repayment_date', 'interest_rate', 
            'interest', 'in_default', 'created_by', 'created_at', 'modified_by', 'amount_taken_lcy_display', 'modified_at', 'interest_lcy_display', 
            'amount_repay', 'amount_repay_lcy_display', 'amount_paid', 'amount_paid_lcy_display','due_balance', 'due_balance_lcy_display'
        ]
        read_only_fields = ['interest', 'amount_repay', 'due_balance', 'in_default', 'amount_taken_lcy_display', 
                            'interest_lcy_display', 'amount_repay_lcy_display', 'amount_paid_lcy_display', 'due_balance_lcy_display', 
                            'created_by', 'created_at', 'modified_by', 'modified_at']
    def get_modified_by(self, obj):
        """Ensure modified_by remains NULL on creation and is only set on update."""
        return obj.modified_by.username if obj.modified_by else None
    
    def get_amount_taken_lcy_display(self, obj):
        if obj.currency and obj.amount_taken_lcy is not None:
            try:
                local_currency = Currency.objects.get(is_local=True)
                return f"{local_currency.code} {obj.amount_taken_lcy:.2f}"
            except Currency.DoesNotExist:
                return f"{obj.amount_taken_lcy:.2f}"  # Fallback if no local currency is defined
        return None
    
    def get_interest_lcy_display(self, obj):
        if obj.currency and obj.interest_lcy is not None:
            try:
                local_currency = Currency.objects.get(is_local=True)
                return f"{local_currency.code} {obj.interest_lcy:.2f}"
            except Currency.DoesNotExist:
                return f"{obj.interest_lcy:.2f}"  # Fallback if no local currency is defined
        return None
    
    def get_amount_repay_lcy_display(self, obj):
        if obj.currency and obj.amount_repay_lcy is not None:
            try:
                local_currency = Currency.objects.get(is_local=True)
                return f"{local_currency.code} {obj.amount_repay_lcy:.2f}"
            except Currency.DoesNotExist:
                return f"{obj.amount_repay_lcy:.2f}"  # Fallback if no local currency is defined
        return None
    
    def get_amount_paid_lcy_display(self, obj):
        if obj.currency and obj.amount_paid_lcy is not None:
            try:
                local_currency = Currency.objects.get(is_local=True)
                return f"{local_currency.code} {obj.amount_paid_lcy:.2f}"
            except Currency.DoesNotExist:
                return f"{obj.amount_paid_lcy:.2f}"  # Fallback if no local currency is defined
        return None
    
    def get_due_balance_lcy_display(self, obj):
        if obj.currency and obj.due_balance_lcy is not None:
            try:
                local_currency = Currency.objects.get(is_local=True)
                return f"{local_currency.code} {obj.due_balance_lcy:.2f}"
            except Currency.DoesNotExist:
                return f"{obj.due_balance_lcy:.2f}"  # Fallback if no local currency is defined
        return None

    def validate(self, data):
        """Perform cross-field validation and assign errors to specific fields."""
        errors = {}

        if data.get("amount_taken") is not None and data["amount_taken"] < 0:
            errors["amount_taken"] = "Loan amount must be non-negative."

        if data.get("interest_rate") is not None and data["interest_rate"] < 0:
            errors["interest_rate"] = "Interest rate must be non-negative."
        loan_date = data.get("loan_date")
        repayment_date = data.get("repayment_date")

        if loan_date and repayment_date and repayment_date < loan_date:
            errors["repayment_date"] = "Repayment date cannot be before loan date."
            
        interest_type = data.get("interest_type")
        compound_frequency = data.get("compound_frequency")

        # Assuming interest_type is an object, adjust based on your model structure
        if interest_type and interest_type.code == "COMPOUND" and not compound_frequency:
            errors["compound_frequency"] = "Compound frequency is required for compound interest."
            
        currency = data.get("currency")
        
        if currency and not currency.is_local:
            if not ExchangeRate.objects.filter(currency=currency).exists():
                errors["currency"] = f"No exchange rate found for currency {currency}"
        if errors:
            raise serializers.ValidationError(errors)

        return data
    
    def create(self, validated_data):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError({"created_by": "User must be authenticated."})

        validated_data["created_by"] = request.user
        validated_data["modified_by"] = None  # Ensure modified_by is null on creation
        try:
            return super().create(validated_data)
        except DjangoValidationError as e:
            if hasattr(e, "message_dict"):
                raise serializers.ValidationError(e.message_dict)
            elif hasattr(e, "messages"):
                raise serializers.ValidationError({"non_field_errors": e.messages})
            else:
                raise serializers.ValidationError({"non_field_errors": [str(e)]})
    
    def update(self, instance, validated_data):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError({"modified_by": "User must be authenticated to modify this record."})

        validated_data["modified_by"] = request.user
        try:
            return super().update(instance, validated_data)
        except DjangoValidationError as e:
            if hasattr(e, "message_dict"):
                raise serializers.ValidationError(e.message_dict)
            elif hasattr(e, "messages"):
                raise serializers.ValidationError({"non_field_errors": e.messages})
            else:
                raise serializers.ValidationError({"non_field_errors": [str(e)]})