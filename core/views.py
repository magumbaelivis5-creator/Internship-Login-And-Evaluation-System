from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .models import UserProfile, Company, Internship, WeeklyReport, Evaluation
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    CompanySerializer, InternshipSerializer,
    WeeklyReportSerializer, EvaluationSerializer
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Registration successful.'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'message': 'Logged out successfully.'})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        data = request.data
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()
        profile = user.profile
        profile.phone = data.get('phone', profile.phone)
        profile.department = data.get('department', profile.department)
        profile.save()
        return Response(UserSerializer(user).data)


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]


class InternshipViewSet(viewsets.ModelViewSet):
    serializer_class = InternshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, 'profile', None)
        if profile and profile.role == 'admin':
            return Internship.objects.all()
        elif profile and profile.role == 'supervisor':
            return Internship.objects.filter(supervisor=user)
        return Internship.objects.filter(student=user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class WeeklyReportViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklyReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, 'profile', None)
        if profile and profile.role == 'admin':
            return WeeklyReport.objects.all()
        elif profile and profile.role == 'supervisor':
            supervised = Internship.objects.filter(supervisor=user)
            return WeeklyReport.objects.filter(internship__in=supervised)
        return WeeklyReport.objects.filter(internship__student=user)


class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, 'profile', None)
        if profile and profile.role == 'admin':
            return Evaluation.objects.all()
        elif profile and profile.role == 'supervisor':
            return Evaluation.objects.filter(evaluator=user)
        return Evaluation.objects.filter(internship__student=user)

    def perform_create(self, serializer):
        serializer.save(evaluator=self.request.user)


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        role = profile.role if profile else 'student'

        if role == 'admin':
            data = {
                'total_students': User.objects.filter(profile__role='student').count(),
                'total_internships': Internship.objects.count(),
                'active_internships': Internship.objects.filter(status='active').count(),
                'total_evaluations': Evaluation.objects.count(),
                'pending_approvals': Internship.objects.filter(status='pending').count(),
                'companies': Company.objects.count(),
            }
        elif role == 'supervisor':
            internships = Internship.objects.filter(supervisor=user)
            data = {
                'my_students': internships.count(),
                'active_internships': internships.filter(status='active').count(),
                'pending_reports': WeeklyReport.objects.filter(
                    internship__in=internships, status='submitted').count(),
                'evaluations_done': Evaluation.objects.filter(evaluator=user).count(),
            }
        else:
            internships = Internship.objects.filter(student=user)
            data = {
                'my_internships': internships.count(),
                'active': internships.filter(status='active').count(),
                'reports_submitted': WeeklyReport.objects.filter(internship__in=internships).count(),
                'evaluations_received': Evaluation.objects.filter(internship__in=internships).count(),
            }

        return Response({'role': role, 'stats': data})


class UsersListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        role = self.request.query_params.get('role', None)
        qs = User.objects.all()
        if role:
            qs = qs.filter(profile__role=role)
        return qs
