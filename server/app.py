#!/usr/bin/env python3

import os
import json
import requests
from datetime import datetime
from pymongo import MongoClient
from flask import Flask, request
from uuid import uuid4

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
    db.data.update({'uuid': uid}, {'$push': {'searches': phrase}}, upsert = True)
    obj = db.data.find_one({'uuid': uid})
    obj['last update'] = datetime.now()
    pages = obj.setdefault('pages', {})
    pages[phrase] = search(phrase)
    db.data.update({'uuid': uid}, obj)
    return ''

@app.route('/schedule', methods=['POST', 'GET'])
def schedule():
    pass # Run scraping for search terms
    # db.data.update({'uuid': uid}, {'$set': {'last update': datetime.now()}})

@app.route('/info/<uid>', methods=['POST', 'GET'])
def get_info(uid):
    pass # return info for given user

def search(query):
    r = requests.get(search_url.format(query, cx, key))
    return r.json()['items']

if __name__ == '__main__':
    client = MongoClient()
    db = client.test_db
    
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)