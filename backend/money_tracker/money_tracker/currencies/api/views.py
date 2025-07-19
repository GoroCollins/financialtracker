from ..models import Currency, ExchangeRate
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema
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
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned, ValidationError as DjangoValidationError
from django.db.models import ProtectedError


logger = logging.getLogger(__name__)
# Create your views here.

@extend_schema(tags=["Currencies"])
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
        
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except ProtectedError:
            return Response({"detail": "This currency is already in use and cannot be deleted."}, status=status.HTTP_400_BAD_REQUEST, )
        return Response(status=status.HTTP_204_NO_CONTENT)

@extend_schema(tags=["Exchange Rates"])
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
        except (DjangoValidationError, DRFValidationError) as e:
            logger.error(f"ValidationError while creating exchange rate: {str(e)}")
            raise DRFValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))

    def perform_update(self, serializer):
        instance = self.get_object()
        data = serializer.validated_data

        allowed_fields = {"is_current"}
        invalid_fields = set(data.keys()) - allowed_fields

        if invalid_fields:
            logger.warning(f"Attempted to update forbidden fields: {invalid_fields}")
            raise DRFValidationError(f"Only the 'is_current' field can be updated. Invalid fields: {', '.join(invalid_fields)}")

        try:
            serializer.save(modified_by=self.request.user)
        except (DjangoValidationError, DRFValidationError) as e:
            logger.error(f"ValidationError while updating is_current: {str(e)}")
            raise DRFValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
        except DjangoValidationError as e:
            logger.warning(f"Attempt to delete current exchange rate: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(status=status.HTTP_204_NO_CONTENT)

@extend_schema(tags=["Local Currency"])
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