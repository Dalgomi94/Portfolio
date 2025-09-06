from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
import requests

# Create your views here.

#def index(request):
#    url = "http://127.0.0.1:8080/get/category/list"
#    response = requests.post(url)
#    data = response.json()
#    print(data)
#    return render(request, 'index.html')

def index(request):
    try:
        # 카테고리
        cat = requests.post(f"http://127.0.0.1:8080/get/category/list", timeout=5)
        print("cat status:", cat.status_code, "body:", cat.text[:300])
        cat.raise_for_status()
        cat_data = cat.json()

        # 콘텐츠
        cont = requests.post(f"http://127.0.0.1:8080/get/content/list", timeout=5)
        print("cont status:", cont.status_code, "body:", cont.text[:300])
        cont.raise_for_status()
        cont_data = cont.json()

    except Exception as e:
        return HttpResponse(f"backend error: {e}", status=502)

    return render(request, "index.html", {"categories": cat_data, "contents": cont_data})
def index_ajax(request):
    url = "http://127.0.0.1:8080/test1212"
    response = requests.get(url)
    data = response.json()
    print(data)
    return JsonResponse(data)