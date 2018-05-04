from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
import json, time

def index(req):
    return HttpResponse("Hello World!")

def game(request):
    with open("test.js", mode='r') as f:
        js = f.read()

    # game_temp = loader.get_template("paperio/game.html")
    # return HttpResponse(game_temp.render({}, request))
    return render(request, 'paperio/game.html', {
        "Scripts" : js,
    })

def check(request):
    try:
        check.lastId
    except:
        check.lastId = -1

    eff_data = {}
    with open("stats.json", mode='r') as f:
        data = f.read().split("$")[:-1]
        item = {}
        for str in data:
            global item
            try:
                item = json.loads(str)
            except:
                continue
            if item["actionId"] >= check.lastId:
                id = item["actionId"]
                eff_data[id] = item["action"]
        check.lastId = item["actionId"]
    """
    data in form: (?)
    {
        time1 : {
            'id' : 1,
            'direction' : 3 // DOWN
        ...},
        time2 : {
            'id' : 2
            'direction' : 2 // UP
        },
        ...
    }
    """
    return HttpResponse(json.dumps(eff_data))

