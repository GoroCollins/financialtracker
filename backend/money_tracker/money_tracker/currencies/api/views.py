from ..models import Currency, ExchangeRate
from rest_framework import viewsets
from .serializers import CurrencySerializer, ExchangeRateSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework import status
from django.http import Http404
import logging
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned

logger = logging.getLogger(__name__)
# Create your views here.


class CurrencyViewSet(viewsets.ModelViewSet):
    serializer_class = CurrencySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_local']

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Currency.objects.filter(created_by=self.request.user)
        return Currency.objects.none()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError as e:
            logger.error(f"IntegrityError on create: {str(e)}")
            raise DRFValidationError({"is_local": ["Only one local currency can exist."]})
        except DRFValidationError as e:
            logger.error(f"ValidationError on create: {e.detail}")
            raise

    def perform_update(self, serializer):
        try:
            serializer.save(modified_by=self.request.user)
        except IntegrityError as e:
            logger.error(f"IntegrityError on update: {str(e)}")
            raise DRFValidationError({"is_local": ["Only one local currency can exist."]})
        except DRFValidationError as e:
            logger.error(f"ValidationError on update: {e.detail}")
            raise

class ExchangeRateViewSet(viewsets.ModelViewSet):
    serializer_class = ExchangeRateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['currency']

    def get_queryset(self):
        qs = ExchangeRate.objects.select_related("currency", "created_by", "modified_by")
        if self.request.user.is_superuser:
            return qs.all()
        return qs.filter(created_by=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        try:
            serializer.save(created_by=self.request.user)
        except DRFValidationError as e:
            logger.error(f"ValidationError while creating exchange rate: {str(e)}")
            raise DRFValidationError(e.detail if hasattr(e, 'detail') else str(e))

    def perform_update(self, serializer):
        instance = self.get_object()
        data = serializer.validated_data
        has_changes = any(getattr(instance, field) != value for field, value in data.items())

        if has_changes:
            try:
                serializer.save(modified_by=self.request.user)
            except DRFValidationError as e:
                logger.error(f"ValidationError while updating exchange rate: {str(e)}")
                raise DRFValidationError(e.detail if hasattr(e, 'detail') else str(e))

    
    # def perform_destroy(self, instance):
    #     """Prevent deletion if the exchange rate was created on the user's join date."""
    #     user = self.request.user

    #     if hasattr(user, "date_joined") and instance.created_at.date() == user.date_joined.date():
    #         raise ValidationError("You cannot delete an exchange rate created on your join date.")

    #     instance.delete()

class GetLocalCurrencyAPIView(APIView):
    """API to fetch the local currency code."""
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail":"Authenticated Required"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            local_currency = get_object_or_404(Currency.objects.filter(created_by=user).only("code"), is_local=True)
            return Response({"local_currency_code": local_currency.code}, status=status.HTTP_200_OK)
        except MultipleObjectsReturned:
            # Log the error and return a 500 response
            logger.error(f"Multiple local currencies found for request by user: {request.user.username}")
            return Response(
                {
                    "error": "Multiple local currencies found. Please contact support.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Http404:
            # Log the error and return a 404 response
            logger.error(f"No local currency found for request by user: {request.user.username}")
            return Response(
                {
                    "error": "No local currency found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.exception(f"Unexpected error in GetLocalCurrencyAPIView: {str(e)}")
            return Response({"error": f"Unexpected error: {str(e)}"},  status=status.HTTP_500_INTERNAL_SERVER_ERROR,)