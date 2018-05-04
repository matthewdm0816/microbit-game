from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
import json

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
    with open("stats.json", mode='r') as f:
        data = json.load(f)
    """
    data in form: (?)
    {
        1 : {
            1 : direction1,
            2 : direction2,
            3 : direction3,
        ...},
        2 : {
            1 : ...
            2 : ...
            ...
        }
    }
    """
    return HttpResponse(json.dumps(data))

# Create your views here.
