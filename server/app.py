#!/usr/bin/env python3

import os
import json
import requests
from uuid import uuid4
from datetime import datetime
from pymongo import MongoClient
from flask import Flask, request

app = Flask(__name__)
search_url = 'https://www.googleapis.com/customsearch/v1?q={}&cx={}&key={}'
cx = os.environ.get('CX')
key = os.environ.get('KEY')

@app.route('/getid', methods=['POST', 'GET']) # change to post only after testing
def get_uuid():
    return str(uuid4())
    
@app.route('/search/<uid>', methods=['POST', 'GET'])
def get_phrase(uid):
    data = request.get_json()
    phrase = data['phrase']
    print(phrase)
    db.data.update({'uuid': uid}, {'$push': {'searches': phrase}}, upsert = True)
    obj = db.data.find_one({'uuid': uid})
    obj['last update'] = datetime.now()
    pages = obj.setdefault('pages', {})
    phpages = pages.setdefault(phrase, {})
    phpages['old'] = list(set(search(phrase)))
    phpages['new'] = []
    db.data.update({'uuid': uid}, obj)
    return ''

@app.route('/schedule', methods=['POST', 'GET'])
def schedule():
    for obj in db.data.find():
        pages = obj.setdefault('pages', {})
        obj['last update'] = datetime.now()
        for phrase in obj['searches']:
            print(phrase)
            newp = list(set(search(phrase)) - set(obj['pages'][phrase]['old']))
            obj['pages'][phrase]['new'].extend(newp)
        db.data.update({'uuid': obj['uuid']}, obj)
    return ''

@app.route('/updates/<uid>', methods=['POST', 'GET'])
def get_info(uid):
    pass # return info for given user

def search(query):
    r = requests.get(search_url.format(query, cx, key))
    return [x['link'] for x in r.json()['items']]

if __name__ == '__main__':
    client = MongoClient()
    db = client.test_db
    
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)