from django.shortcuts import render
from django.http import JsonResponse
from .forms import LocationForm
from .models import District, State

def index(request):
    form = LocationForm()
    return render(request, 'index.html', {'form': form})

def load_districts(request):
    state_id = request.GET.get('state')
    districts = District.objects.filter(state_id=state_id).order_by('name')
    return JsonResponse(list(districts.values('id', 'name')), safe=False)

def district_details(request, district_name):
    district = District.objects.get(name=district_name)
    data = {
        'state': district.state.name,
        'district': district.name,
        'last_year': district.last_year,
        'current_year': district.current_year,
        'growth_percentage': district.growth_percentage
    }
    return JsonResponse(data)

def district_growth(request, district_name):
    district = District.objects.get(name=district_name)
    data = {
        'growth_percentage': district.growth_percentage
    }
    return JsonResponse(data)

def state_districts(request, state_name):
    state = State.objects.get(name=state_name)
    districts = District.objects.filter(state=state).order_by('name')
    district_names = [district.name for district in districts]
    return JsonResponse({'districts': district_names})
