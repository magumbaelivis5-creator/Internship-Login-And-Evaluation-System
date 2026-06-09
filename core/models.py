from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('supervisor', 'Supervisor'),
        ('admin', 'Admin'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    student_number = models.CharField(max_length=20, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class Company(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    contact_person = models.CharField(max_length=100)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    industry = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Companies"


class Internship(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    ]
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='internships')
    supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='supervised_internships')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='internships')
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.username} at {self.company.name}"


class WeeklyReport(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
    ]
    internship = models.ForeignKey(Internship, on_delete=models.CASCADE, related_name='weekly_reports')
    week_number = models.IntegerField()
    activities = models.TextField()
    challenges = models.TextField(blank=True)
    achievements = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    submitted_at = models.DateTimeField(auto_now_add=True)
    supervisor_comment = models.TextField(blank=True)

    def __str__(self):
        return f"Week {self.week_number} - {self.internship}"


class Evaluation(models.Model):
    internship = models.ForeignKey(Internship, on_delete=models.CASCADE, related_name='evaluations')
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='evaluations_given')
    technical_skills = models.IntegerField(default=0)  # 0-100
    communication = models.IntegerField(default=0)
    teamwork = models.IntegerField(default=0)
    punctuality = models.IntegerField(default=0)
    initiative = models.IntegerField(default=0)
    overall_score = models.FloatField(default=0)
    comments = models.TextField(blank=True)
    grade = models.CharField(max_length=5, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        scores = [self.technical_skills, self.communication, self.teamwork,
                  self.punctuality, self.initiative]
        self.overall_score = sum(scores) / len(scores)
        if self.overall_score >= 85:
            self.grade = 'A'
        elif self.overall_score >= 70:
            self.grade = 'B'
        elif self.overall_score >= 60:
            self.grade = 'C'
        elif self.overall_score >= 50:
            self.grade = 'D'
        else:
            self.grade = 'F'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Evaluation for {self.internship} - {self.grade}"
