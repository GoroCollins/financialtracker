from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from ..models import EarnedIncome, PortfolioIncome, PassiveIncome
from . serializers import EarnedIncomeSerializer, PortfolioIncomeSerializer, PassiveIncomeSerializer
from rest_framework.views import APIView
from django.db.models import Sum
from rest_framework.response import Response
from money_tracker.currencies.models import Currency
# Create your views here.
# Base ViewSet for common functionality
class BaseIncomeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ['income_name', 'currency__code']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return self.queryset.filter(created_by=self.request.user)  # ✅ Only their own incomes
        return self.queryset.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

# Inherited ViewSets
class EarnedIncomeViewSet(BaseIncomeViewSet):
    queryset = EarnedIncome.objects.all()
    serializer_class = EarnedIncomeSerializer

class PortfolioIncomeViewSet(BaseIncomeViewSet):
    queryset = PortfolioIncome.objects.all()
    serializer_class = PortfolioIncomeSerializer

class PassiveIncomeViewSet(BaseIncomeViewSet):
    queryset = PassiveIncome.objects.all()
    serializer_class = PassiveIncomeSerializer
    
# Total Income API View
class TotalIncomeAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail":"Authenticated Required"}, status=status.HTTP_401_UNAUTHORIZED)
        # Calculate the total income for each type
        earned_income_total = EarnedIncome.objects.filter(created_by=user).aggregate(total=Sum('amount_lcy'))['total'] or 0
        portfolio_income_total = PortfolioIncome.objects.filter(created_by=user).aggregate(total=Sum('amount_lcy'))['total'] or 0
        passive_income_total = PassiveIncome.objects.filter(created_by=user).aggregate(total=Sum('amount_lcy'))['total'] or 0

        # Sum all incomes
        total_income = earned_income_total + portfolio_income_total + passive_income_total
        return Response({
            "total_income": total_income,
            "earned_income": earned_income_total,
            "portfolio_income": portfolio_income_total,
            "passive_income": passive_income_total
        }, status=status.HTTP_200_OK)

