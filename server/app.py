#!/usr/bin/env python3

import os
from pymongo import MongoClient
from flask import Flask, request
from uuid import uuid4

app = Flask(__name__)

@app.route('/getid', methods=['POST', 'GET']) # change to post only after testing
def get_uuid():
    return str(uuid4())
    
@app.route('/search/<uid>', methods=['POST', 'GET'])
def get_phrase(uid):
    # Get the phrase from document
    print(request.args)
    print(request.data)
    print(request.form)
    # db.data.update({'uuid': uid}, {'$push': {'searches': phrase}}, upsert = True)
    return ""

if __name__ == '__main__':
    client = MongoClient()
    db = client.data_finder
    
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)