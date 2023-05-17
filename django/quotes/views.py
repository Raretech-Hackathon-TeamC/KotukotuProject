from django.http import JsonResponse
from .models import Quote
import random

def random_quote(request):
    count = Quote.objects.count()
    random_index = random.randint(0, count - 1)
    quote = Quote.objects.all()[random_index]
    return JsonResponse({'quote': quote.text})
