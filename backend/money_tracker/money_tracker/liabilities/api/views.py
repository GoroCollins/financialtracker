from .. models import Loan, InterestType
from drf_spectacular.utils import extend_schema
from . serializers import LoanSerializer, InterestTypeSerializer
from rest_framework import viewsets, status
from rest_framework.views import APIView
from django.db.models import Sum
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

# Create your views here.
@extend_schema(tags=["Loans"])
class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all().select_related("currency", "created_by", "modified_by", "interest_type")
    serializer_class = LoanSerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return self.queryset.filter(created_by=self.request.user)  # ✅ Only their own assets
        return self.queryset.none()
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

@extend_schema(tags=["Interest Types"])
class InterestTypeViewSet(viewsets.ModelViewSet):
    queryset = InterestType.objects.all().select_related("created_by", "modified_by")
    serializer_class = InterestTypeSerializer
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return self.queryset.filter(created_by=self.request.user)  # ✅ Only their own assets
        return self.queryset.none()
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    def perform_update(self, serializer):
        serializer.save(modified_by=self.request.user)

@extend_schema(tags=["Total Liabilities"])
class TotalLiabilitiesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail":"Authenticated Required"}, status=status.HTTP_401_UNAUTHORIZED)
        loan_total = Loan.objects.filter(created_by=user).aggregate(total=Sum('amount_taken_lcy'))['total'] or 0
        

        total_liabilities = loan_total 

        return Response({"total_liabilities": total_liabilities, "loans": loan_total}, status=status.HTTP_200_OK)