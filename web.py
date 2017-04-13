from flask import Flask, jsonify, request, redirect, url_for, current_app
import os
import json
#from flask.ext import restful
from flask_restful import reqparse, abort, Api, Resource
from tinydb import TinyDB, Query
from flask_cors import CORS
from datetime import datetime
import datetime as dt

UPLOAD_FOLDER = 'C:/Users/Raj/Desktop/StocksTrend.in/static/adminsite/uploadedimages'
DB_FOLDER = 'C:/Users/Raj/Desktop/StocksTrend.in/DB/db.json'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['DB_FOLDER'] = DB_FOLDER

#CORS(app, supports_credentials=True)

api = Api(app)

parser = reqparse.RequestParser()
parser.add_argument('data')

@app.route('/')
def index_html():
      return current_app.send_static_file('index.html')

class AdminLogin(Resource):
   def post(self):
      name=request.form.get('name','')
      password=request.form.get('password','')
      
      if(name=='stockstrend' and password=='stockstrend'):
         #print('CREDENTIALS ## ',email,':',password )
         return current_app.send_static_file('admin_index.html')
      else :
         return current_app.send_static_file('index_login.html')
      

class AdminSite(Resource):
   def get(self):
      #return {'hello': 'world'}
      return current_app.send_static_file('index_login.html')

class AdminWeeklyCall(Resource):
   def get(self):
      db = TinyDB(app.config['DB_FOLDER'])
      table=db.table('weeklycalls')
      Calls = Query()
      active_call=table.search(Calls.status=='A')
      #active_call=table.all()
      weekly_call = list()
      for item in active_call:
         #item[id] = item.eid
         data = json.dumps(item)
         data_obj = json.loads(data)
         data_obj['eid'] = item.eid
         print('*********', data_obj)
         weekly_call.append(data_obj)
      return weekly_call
  
   def put(self):
      print('Inside PUT Method')
      json_data = request.get_json(silent=True)
                
      db = TinyDB(app.config['DB_FOLDER'])
      table=db.table('weeklycalls')
                
      insert_items = json.loads(json_data['insert_item'])
      for item in insert_items:
         #item = json.loads(item)
         eid = int(item['id']);
         if(eid>0):
            item.pop('id',None)
            print('########### Updating Record : ' , eid)
            table.update(item, eids=[eid])
         elif(eid==0):
            item.pop('id',None)
            print('########### Inserting Record : ' , eid)
            table.insert(item)

      remove_items = json.loads(json_data['remove_item'])
      for item in remove_items:
         eid = int(item['id'])
         print('########### Removing Record : ' , eid)
         table.remove(eids=[eid])

      #table.insert_multiple(json_data)       
      return {'status':'success'}

class LastWeekCalls(Resource):
   def get(self):
      db = TinyDB(app.config['DB_FOLDER'])
      table=db.table('weeklycalls')
      Calls = Query()
      expired_call=table.search(Calls.status=='E')
      print(expired_call)
      sorted_calls = sorted(expired_call, key=lambda x: datetime.strptime(x['date'], '%d/%m/%Y'))
      print('***************************************************************************************')
      print(sorted_calls)

      #Get todays date
      today = dt.date.today()
      #Last Monday  : today - datetime.timedelta(days=today.weekday())
      # Previous Week Monday : today - datetime.timedelta(days=today.weekday(),weeks=1)
      # We will get the both the Sunday hence adding one more day to subtract
      lastSunday = today - dt.timedelta(days=today.weekday()+1)
      previousSunday = today - dt.timedelta(days=today.weekday()+1,weeks=1)

      print('LastSunday :', lastSunday)
      print('Previous Sunday :',previousSunday)

      filtered_calls = list()
      for call in sorted_calls:
         calldate = datetime.strptime(call['date'], '%d/%m/%Y').date()
         if previousSunday < calldate < lastSunday:
            print('YESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS')
            filtered_calls.append(call)
         else :
            print('NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO')

      print('Filtered Calls:', filtered_calls)
      #returned_data = {}
      #returned_data['data']=filtered_calls
      return filtered_calls

class AdminHistoricalCall(Resource):
   def get(self):
      db = TinyDB(app.config['DB_FOLDER'])
      table=db.table('weeklycalls')
      Calls = Query()
      expired_call=table.search(Calls.status=='E')
      #active_call=table.all()
      weekly_call = list()
      for item in expired_call:
         #item[id] = item.eid
         data = json.dumps(item)
         data_obj = json.loads(data)
         data_obj['eid'] = item.eid
         print('*********', data_obj)
         weekly_call.append(data_obj)

      returned_data = {}
      returned_data['data']=weekly_call
      return returned_data

class AdminAnalysis(Resource):
   def post(self):
      print('Post Method@@@@@@@@@')
      print('Name :', request.form.get('accessCode',''))
      print('Date :', request.form.get('accessCode4',''))
      file=request.files['file']
      print('Post Method@@@@@@@@@')
      eid = int(request.form.get('id',''));
      print('ID VALUE: ', request.form.get('id',''))
         
      if eid==0 and file.filename=='':
         print('No Selected File')
         return
      else:
         if file.filename!='':
            print('Uploading !!!!!!!!!!!!!!! ', file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
                        
         analysis = {}
         analysis['script'] = request.form.get('script','');
         analysis['action'] = request.form.get('action','');
         analysis['entryprice'] = request.form.get('entryprice','');
         analysis['stoploss'] = request.form.get('stoploss','');
         analysis['target']=request.form.get('target','');
         analysis['calldate']=request.form.get('calldate','');
         analysis['comments']=request.form.get('comments','');
         analysis['status']=request.form.get('status','');
         analysis['analysisimage']=file.filename

         db = TinyDB(app.config['DB_FOLDER'])
         table=db.table('analysis')

         if eid > 0:
            print('##### Updating Records Analysis :',eid)
            analysis['analysisimage']=request.form.get('filename','');            
            analysisid = table.update(analysis, eids=[eid])  
         else :
            print('##### Inserting Records Analysis :',eid)
            analysisid = table.insert(analysis);

         print('Uploaded !!!!!!!!!!!!!!!')

      return {'id':analysisid}

   def get(self):
      db = TinyDB(app.config['DB_FOLDER'])
      table=db.table('analysis')
      analysis_call =table.all()
      analysis_list = list()
      for item in analysis_call:
         #item[id] = item.eid
         data = json.dumps(item)
         data_obj = json.loads(data)
         data_obj['eid'] = item.eid
         #print('*********', data_obj)
         analysis_list.append(data_obj)

      returned_data = {}
      returned_data['data']=analysis_list
      print('&&&& : ',returned_data)
      return returned_data

class Analysis(Resource):
   def get(self):
      db = TinyDB(app.config['DB_FOLDER'])
      table=db.table('analysis')
      analysis_call =table.all()
      analysis_list = list()
      analysis_list.append(analysis_call[0])
      return analysis_list   

api.add_resource(AdminSite, '/admin')
api.add_resource(AdminLogin, '/login')
api.add_resource(AdminWeeklyCall, '/admin/calls')
api.add_resource(AdminHistoricalCall, '/admin/historicalcalls')
api.add_resource(AdminAnalysis,'/admin/analysis')
api.add_resource(LastWeekCalls,'/lastweekcalls')
api.add_resource(Analysis,'/analysis')

if __name__ == '__main__':
    app.run(debug=True)
