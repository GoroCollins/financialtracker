from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from . . models import LiquidAsset, Equity, InvestmentAccount, RetirementAccount
from . serializers import LiquidAssetSerializer, EquitySerializer, InvestmentAccountSerializer, RetirementAccountSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum


# Create your views here.
class BaseAssetViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = ["created_at", "amount"]
    ordering = ["-created_at"]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return self.queryset.filter(created_by=self.request.user)  # ✅ Only their own assets
        return self.queryset.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

class LiquidAssetViewSet(BaseAssetViewSet):
    queryset = LiquidAsset.objects.all()
    serializer_class = LiquidAssetSerializer
    search_fields = ["source", "currency__code"]

class EquityViewSet(BaseAssetViewSet):
    queryset = Equity.objects.all()
    serializer_class = EquitySerializer
    search_fields = ["name", "ratio", "currency__code"]

class InvestmentAccountViewSet(BaseAssetViewSet):
    queryset = InvestmentAccount.objects.all()
    serializer_class = InvestmentAccountSerializer
    search_fields = ["name", "currency__code"]

class RetirementAccountViewSet(BaseAssetViewSet):
    queryset = RetirementAccount.objects.all()
    serializer_class = RetirementAccountSerializer
    search_fields = ["name", "employer", "currency__code"]

class TotalAssetsAPIView(APIView):
    """API endpoint to get the total expenses across all categories."""
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail":"Authenticated Required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        liquid_assets_total = LiquidAsset.objects.filter(created_by=user).aggregate(total=Sum('amount'))['total'] or 0
        equity_total = Equity.objects.filter(created_by=user).aggregate(total=Sum('amount'))['total'] or 0
        investment_account_total = InvestmentAccount.objects.filter(created_by=user).aggregate(total=Sum('amount'))['total'] or 0
        retirement_account_total = RetirementAccount.objects.filter(created_by=user).aggregate(total=Sum('amount'))['total'] or 0

        total_assets = liquid_assets_total + equity_total + investment_account_total + retirement_account_total
        
        return Response({
            "total_assets": total_assets,
            "liquid_assets": liquid_assets_total,
            "equities": equity_total,
            "investment_accounts": investment_account_total,
            "retirement_accounts": retirement_account_total,
        }, status=status.HTTP_200_OK)
    