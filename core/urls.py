from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'companies', views.CompanyViewSet)
router.register(r'internships', views.InternshipViewSet, basename='internship')
router.register(r'reports', views.WeeklyReportViewSet, basename='report')
router.register(r'evaluations', views.EvaluationViewSet, basename='evaluation')

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', views.LoginView.as_view()),
    path('auth/logout/', views.LogoutView.as_view()),
    path('auth/me/', views.MeView.as_view()),
    path('dashboard/stats/', views.DashboardStatsView.as_view()),
    path('users/', views.UsersListView.as_view()),
     
]
urlpatterns += router.urls