from rest_framework import serializers
from . import models
from rest_framework_simplejwt.views import TokenObtainPairView;
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer;

######## CO2CHAMPION ########

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        if hasattr(user, 'company'):
            token['company_id'] = user.company.id
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class CompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Company
        fields = '__all__'
        read_only_fields = ['id']

class GoalSerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(read_only=True)

    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user.company
        return super().create(validated_data)


    class Meta:
        model = models.Goal
        fields = '__all__'
        read_only_fields = ['id']

class ReportSerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = models.Report
        fields = '__all__'
        read_only_fields = ['id', 'company']

class RankHistorySerializer(serializers.ModelSerializer):
    company = serializers.PrimaryKeyRelatedField(queryset=models.Company.objects.all())

    class Meta:
        model = models.RankHistory
        fields = '__all__'
        read_only_fields = ['id']
