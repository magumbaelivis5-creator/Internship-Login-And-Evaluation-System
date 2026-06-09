from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile, Company, Internship, WeeklyReport, Evaluation


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'student_number', 'phone', 'department']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=['student', 'supervisor', 'admin'], default='student')
    student_number = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'role', 'student_number', 'phone', 'department']

    def create(self, validated_data):
        role = validated_data.pop('role', 'student')
        student_number = validated_data.pop('student_number', '')
        phone = validated_data.pop('phone', '')
        department = validated_data.pop('department', '')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, role=role, student_number=student_number,
                                   phone=phone, department=department)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials.")


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


class InternshipSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = Internship
        fields = '__all__'
        read_only_fields = ['student']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}".strip() or obj.student.username

    def get_supervisor_name(self, obj):
        if obj.supervisor:
            return f"{obj.supervisor.first_name} {obj.supervisor.last_name}".strip() or obj.supervisor.username
        return None

    def get_company_name(self, obj):
        return obj.company.name


class WeeklyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyReport
        fields = '__all__'
        read_only_fields = ['submitted_at']


class EvaluationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Evaluation
        fields = '__all__'
        # 👇 CHANGED THIS TO EVALUATOR TO MATCH YOUR VIEWS.PY
        read_only_fields = ['overall_score', 'grade', 'created_at', 'updated_at', 'evaluator']

    def get_student_name(self, obj):
        student = obj.internship.student
        return f"{student.first_name} {student.last_name}".strip() or student.username

    def to_internal_value(self, data):
        if 'internship' in data and data['internship'] == '':
            data['internship'] = None
        return super().to_internal_value(data)
