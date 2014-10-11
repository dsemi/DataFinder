#!/usr/bin/env python3

import os
from datetime import datetime
from pymongo import MongoClient
from flask import Flask, request
from uuid import uuid4

app = Flask(__name__)

@app.route('/getid', methods=['POST', 'GET']) # change to post only after testing
def get_uuid():
    return str(uuid4())
    
@app.route('/search/<uid>', methods=['POST', 'GET'])
def get_phrase(uid):
    phrase = request.data
    db.data.update({'uuid': uid}, {'$push': {'searches': phrase.decode()}}, upsert = True)
    return ""

@app.route('/schedule', methods=['POST', 'GET'])
def schedule():
    pass # Run scraping for search terms
    # db.data.update({'uuid': uid}, {'$set': {'last update': datetime.now()}})

@app.route('/info/<uid>', methods=['POST', 'GET'])
def get_info(uid):
    pass # return info for given user
    
if __name__ == '__main__':
    client = MongoClient()
    db = client.test_db
    
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)