#!/usr/bin/env python

from flask import Flask
from uuid import uuid4

app = Flask(__name__)

@app.route('/')
def root():
    return 'Hello worlds'

@app.route('/getid', methods=['POST'])
def get_uuid():
    return str(uuid4())
    
@app.route('/<uid>')
def get_phrase(uid):
    pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)