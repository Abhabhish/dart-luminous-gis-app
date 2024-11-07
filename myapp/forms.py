from django import forms
from .models import State, District

class LocationForm(forms.Form):
    state = forms.ModelChoiceField(queryset=State.objects.all(), empty_label="Select State")
    district = forms.ModelChoiceField(queryset=District.objects.none(), required=False, empty_label="Select District")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'state' in self.data:
            try:
                state_id = int(self.data.get('state'))
                self.fields['district'].queryset = District.objects.filter(state_id=state_id).order_by('name')
            except (ValueError, TypeError):
                pass
