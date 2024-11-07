from django.db import models

class State(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class District(models.Model):
    name = models.CharField(max_length=100)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='districts')
    last_year = models.FloatField(null=True)
    current_year = models.FloatField(null=True)
    growth_percentage = models.FloatField(null=True)

    def __str__(self):
        return self.name
