from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.db.models import Sum
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import FixedExpense, VariableExpense, DiscretionaryExpense
from .serializers import FixedExpenseSerializer, VariableExpenseSerializer, DiscretionaryExpenseSerializer
from rest_framework.exceptions import PermissionDenied

class BaseExpenseViewSet(viewsets.ModelViewSet):
    """Base viewset for expense models."""
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ["expense_name", "currency__code"]
    ordering_fields = ["created_at", "amount"]
    ordering = ["-created_at"]
    
    def get_queryset(self):
        """Return expenses belonging to the authenticated user."""
        user = self.request.user
        if user.is_authenticated:
            return self.queryset.filter(created_by=self.request.user)
        return self.queryset.none()
    
    # def get_queryset(self):
    #     """Admins can see all expenses; users see only their own."""
    #     user = self.request.user
    #     if user.is_authenticated:
    #         return self.queryset if user.is_staff else self.queryset.filter(created_by=user)
    #     return self.queryset.none()

    def perform_update(self, serializer):
        """Ensure modified_by is set correctly before saving."""
        user = self.request.user
        if not user.is_authenticated:
            raise PermissionDenied("Authentication required to modify this record.")
        serializer.save(modified_by=user)

class FixedExpenseViewSet(BaseExpenseViewSet):
    queryset = FixedExpense.objects.all()
    serializer_class = FixedExpenseSerializer

class VariableExpenseViewSet(BaseExpenseViewSet):
    queryset = VariableExpense.objects.all()
    serializer_class = VariableExpenseSerializer

class DiscretionaryExpenseViewSet(BaseExpenseViewSet):
    queryset = DiscretionaryExpense.objects.all()
    serializer_class = DiscretionaryExpenseSerializer

class TotalExpensesAPIView(APIView):
    """API endpoint to get the total expenses across all categories."""
    permission_classes = [IsAuthenticated]
    # def get(self, request):
    #     fixed_expenses_total = FixedExpense.objects.aggregate(total=Sum("amount"))["total"] or 0
    #     variable_expenses_total = VariableExpense.objects.aggregate(total=Sum("amount"))["total"] or 0
    #     discretionary_expenses_total = DiscretionaryExpense.objects.aggregate(total=Sum("amount"))["total"] or 0

    #     total_expenses = fixed_expenses_total + variable_expenses_total + discretionary_expenses_total

    #     return Response({"total_expenses": total_expenses})
    
    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=401)

        fixed_expenses_total = FixedExpense.objects.filter(created_by=user).aggregate(total=Sum("amount"))["total"] or 0
        variable_expenses_total = VariableExpense.objects.filter(created_by=user).aggregate(total=Sum("amount"))["total"] or 0
        discretionary_expenses_total = DiscretionaryExpense.objects.filter(created_by=user).aggregate(total=Sum("amount"))["total"] or 0

        total_expenses = fixed_expenses_total + variable_expenses_total + discretionary_expenses_total
        
        return Response({
            "total_expenses": total_expenses,
            "fixed_expenses": fixed_expenses_total,
            "variable_expenses": variable_expenses_total,
            "discretionary_expenses": discretionary_expenses_total,
        }, status=status.HTTP_200_OK)
