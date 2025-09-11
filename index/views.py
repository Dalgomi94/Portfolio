from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
import requests

def index(request):
    try:
        _index_data = request.session.get('index')
        print(' index_data :', _index_data)

        # 카테고리
        cat = requests.post(f"http://127.0.0.1:8080/get/category/list", timeout=5)
        print("cat status:", cat.status_code, "body:", cat.text[:300])
        cat.raise_for_status()
        cat_data = cat.json()

        if not _index_data:
            _index_data = {
                'current_category_seq' : cat_data[0]['seq'],
                'theme' : 'dark'
            }
            request.session['index'] = _index_data

        # 콘텐츠
        cont = requests.post(f"http://127.0.0.1:8080/get/content/list", timeout=5)
        print("cont status:", cont.status_code, "body:", cont.text[:300])
        cont.raise_for_status()
        cont_data = cont.json()

    except Exception as e:
        return HttpResponse(f"backend error: {e}", status=502)

    data = {
        "index_info": _index_data,
        "categories": cat_data,
        "contents": cont_data
    }
    
    return render(request, "index.html", data)

@csrf_exempt
def ajax_index_data_save(request):
    seq = request.POST.get('seq')
    if seq:
        _index_data = request.session.get('index')
        _index_data['current_category_seq'] = int(seq)
        request.session['index'] = _index_data
    print('_index_data: ', request.session.get('index'))
    return JsonResponse({'status' : 200})