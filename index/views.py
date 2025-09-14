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
        req = {
            'target': _index_data['current_category_seq']
        }

        # 콘텐츠
        contents_response = requests.post(f"http://127.0.0.1:8080/get/content/list", params=req, timeout=5)
        contents = None
        if contents_response.status_code == 200:
            contents = contents_response.json()
    except Exception as e:
        return HttpResponse(f"backend error: {e}", status=502)

    # 유져
    users = []
    try:
        users_resp = requests.post("http://127.0.0.1:8080/get/user/list", params={}, timeout=5)
        print("users status:", users_resp.status_code, "body:", users_resp.text[:300])
        users_resp.raise_for_status()
        users = users_resp.json()
    except Exception as ue:
        print("users fetch error:", ue)


    data = {
        "index_info": _index_data,
        "categories": cat_data,
        "contents": contents,
        "users": users
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

    req = {
            'target': seq
        }
    contents_response = requests.post(f"http://127.0.0.1:8080/get/content/list", params=req, timeout=5)
    res = {'status': 200, 'content': ''}
    if contents_response.status_code == 200:
        contents = contents_response.json()
        _ren = render(request, "contents.html", {'contents': contents})
        res['content'] = _ren.content.decode('utf-8')
    return JsonResponse(res)

import requests
base = "http://127.0.0.1:8080"  # 실제 FastAPI 호스트/포트로
r = requests.get(f"{base}/openapi.json", timeout=5)
print("openapi:", r.status_code)
if r.ok:
    paths = list(r.json().get("paths", {}).keys())
    print("=== FASTAPI PATHS ===")
    for p in paths[:200]:
        print(p)