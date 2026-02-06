from rest_framework import serializers
from .models import Dataset, Equipment
import json

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'

class DatasetSerializer(serializers.ModelSerializer):
    summary = serializers.SerializerMethodField()

    class Meta:
        model = Dataset
        fields = ['id', 'name', 'upload_time', 'row_count', 'summary']

    def get_summary(self, obj):
        return json.loads(obj.summary_json)

class DatasetDetailSerializer(serializers.ModelSerializer):
    equipment = EquipmentSerializer(many=True, read_only=True)
    summary = serializers.SerializerMethodField()

    class Meta:
        model = Dataset
        fields = ['id', 'name', 'upload_time', 'row_count', 'summary', 'equipment']

    def get_summary(self, obj):
        return json.loads(obj.summary_json)
