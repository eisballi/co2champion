from rest_framework import serializers
from . import models

class GenreSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Genre
        fields = '__all__'
        read_only_fields = ['id']

class PersonSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Person
        fields = '__all__'

class MovieSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = models.Movie
        fields = '__all__'  

######## CO2CHAMPION ########

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Company
        fields = '__all__'
        read_only_fields = ['id']

class GoalSerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(queryset=models.Company.objects.all())

    class Meta:
        model = models.Goal
        fields = '__all__'
        read_only_fields = ['id']

class ReportSerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(queryset=models.Company.objects.all())

    class Meta:
        model = models.Report
        fields = '__all__'
        read_only_fields = ['id']
