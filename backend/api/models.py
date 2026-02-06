from django.db import models
import json

class Dataset(models.Model):
    name = models.CharField(max_length=255)
    upload_time = models.DateTimeField(auto_now_add=True)
    row_count = models.IntegerField()
    summary_json = models.TextField() # Store pre-calculated summary stats

    class Meta:
        ordering = ['-upload_time']

    def get_summary(self):
        return json.loads(self.summary_json)

class Equipment(models.Model):
    dataset = models.ForeignKey(Dataset, related_name='equipment', on_delete=models.CASCADE)
    equipment_name = models.CharField(max_length=255)
    equipment_type = models.CharField(max_length=100)
    flowrate = models.FloatField()
    pressure = models.FloatField()
    temperature = models.FloatField()

    def __str__(self):
        return self.equipment_name
