import urllib.request, urllib.error, json
try:
    data = json.dumps({'email': 't@m.com', 'password': 't'}).encode()
    req = urllib.request.Request('http://127.0.0.1:8000/api/auth/register', data=data, headers={'Content-Type': 'application/json'})
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print('ERROR_BODY:', e.read().decode())
