#!/usr/bin/env python3

import os
from pymongo import MongoClient
from flask import Flask, request
from uuid import uuid4

app = Flask(__name__)

@app.route('/getid') # change to post only after testing
def get_uuid():
    return str(uuid4())
    
@app.route('/search/<uid>')
def get_phrase(uid): # Change to post only after testing
    # Get the phrase from document
    # phrase
    db.data.update({'uuid': uid}, {'$push': {'searches': phrase}}, upsert = True)
    return

if __name__ == '__main__':
    client = MongoClient()
    db = client.data_finder
    
    app.run(host='0.0.0.0', port=os.environ.get('PORT', 5000), debug=True)