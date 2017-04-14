'''
Created on 30-Sep-2016

@author: dess
'''
import tornado.httpserver, tornado.ioloop, tornado.options, tornado.web, os.path, random, string
from tornado.options import define, options
import tornado.web as web
import json
import os
from tinydb import TinyDB, Query
from datetime import datetime
import datetime as dt

define("port", default=8888, help="run on the given port", type=int)
public_root = os.path.join(os.path.dirname(__file__), '')

UPLOAD_FOLDER = 'C:/Users/Raj/Desktop/StocksTrend.in/static/adminsite/uploadedimages/'
DB_FOLDER = 'C:/Users/Raj/Desktop/StocksTrend.in/DB/db.json'

class Application(tornado.web.Application):
   def __init__(self):
      settings = {
         "static_path": os.path.join(os.path.dirname(__file__), "static")}
      handlers = [
         (r"/admin/calls", AdminWeeklyCallHandler),
         (r"/admin/historicalcalls", AdminHistoricalCallHandler),
         (r"/admin/analysis", AdminAnalysisHandler),
         (r"/", IndexHandler),
         (r"/admin", AdminIndexHandler),
         (r"/admin/login", AdminLoginHandler),
         (r"/calls", AdminWeeklyCallHandler),
         (r"/lastweekcalls", StockstrendCallPerformanceHandler),
         (r"/analysis", StockstrendAnalysisHandler),
         (r"/buyindicator", StockstrendBuyIndiacator),
         (r"/register", StockstrendRegistration),
         (r"/sendmsg", StockstrendSendMessage),
         (r"/logout", AdminLogoutHandler),
         (r'/(.*)', web.StaticFileHandler, {'path': public_root})
      ]
      tornado.web.Application.__init__(self, handlers,cookie_secret='1234321', debug=True)

class AdminIndexHandler(tornado.web.RequestHandler):
   def get(self):
      self.render("static/index_login.html")

class AdminLoginHandler(tornado.web.RequestHandler):
   def post(self):
      name= self.get_argument('name','')
      password= self.get_argument('password','')
      
      if(name=='stockstrend' and password=='stockstrend'):
         #print('CREDENTIALS ## ',email,':',password )
         self.set_secure_cookie("user", self.get_argument("name"),expires_days=None)
         self.render('static/admin_home.html')
      else :
         self.render('static/index_loginerror.html')

class AdminLogoutHandler(tornado.web.RequestHandler):
   def post(self):
      self.set_secure_cookie("user","",expires_days=None)
      self.render('static/index_login.html')

class AdminWeeklyCallHandler(tornado.web.RequestHandler):
   #Get the List of all the active weekly calls
   def get(self):
      print(self.request.uri)

      if self.request.uri!='/calls' and not self.get_secure_cookie("user"):
         self.render('static/index_login.html')
         return

      db = TinyDB(DB_FOLDER)
      table=db.table('weeklycalls')
      Calls = Query()
      active_call=table.search(Calls.status=='A')
      
      #Add all the weekly call to a list with eid key
      weekly_call = list()
      for item in active_call:
         data = json.dumps(item)
         data_obj = json.loads(data)
         data_obj['eid'] = item.eid
         weekly_call.append(data_obj)
      #print('AdminWeeklyCallHandlerr # Get Method # Weely Calls # ', weekly_call)
      returned_data = {}
      returned_data['data']=weekly_call
      self.write(json.dumps(returned_data))
   
   #Create or Update the list of all the active weekly calls
   def post(self):
      if not self.get_secure_cookie("user"):
         self.render('static/index_login.html')
         return

      db = TinyDB(DB_FOLDER)
      table=db.table('weeklycalls')  

      eid = int(self.get_argument('id',''));
      weeklycall = {}
      weeklycall['script'] = self.get_argument('script','');
      weeklycall['action'] = self.get_argument('action','');
      weeklycall['entryprice'] = self.get_argument('entryprice','');
      weeklycall['stoploss'] = self.get_argument('stoploss','');
      weeklycall['target']=self.get_argument('target','');
      weeklycall['date']=self.get_argument('calldate','');
      weeklycall['result']=self.get_argument('result','');
      weeklycall['status']=self.get_argument('status','');
      
      if eid > 0:
         print('AdminWeeklyCallHandlerr # Post Method # Updating Weekly Call with ID :',eid)
         callid = table.update(weeklycall, eids=[eid])  
      else :
         print('AdminWeeklyCallHandlerr # Post Method # Inserting Weekly Call #',weeklycall)
         callid = table.insert(weeklycall);

      self.write(json.dumps({'id':callid}))

class AdminHistoricalCallHandler(tornado.web.RequestHandler):
   def get(self):
      if not self.get_secure_cookie("user"):
         self.render('static/index_login.html')
         return

      db = TinyDB(DB_FOLDER)
      table=db.table('weeklycalls')
      Calls = Query()
      expired_call=table.search(Calls.status=='E')
      
      historical_calls = list()
      for item in expired_call:
         data = json.dumps(item)
         data_obj = json.loads(data)
         data_obj['eid'] = item.eid
         historical_calls.append(data_obj)

      returned_data = {}
      returned_data['data']=historical_calls
      #print('AdminHistoricalCallHandler # Get Method # Historical Calls # ', returned_data)
      self.write(json.dumps(returned_data))

class AdminAnalysisHandler(tornado.web.RequestHandler):
   def post(self):
      if not self.get_secure_cookie("user"):
         self.render('static/index_login.html')
         return

      original_fname=''
      if 'file' in self.request.files:
         file = self.request.files['file'][0]
         original_fname = file['filename']
      #print('AdminAnalysisHandler # Post Method # Upload File Name # '+str(original_fname))

      #If eid is 0, then new analysis record to be created and new file will be saved
      eid = int(self.get_argument('id',''));   
      if eid==0 and original_fname=='':
         print('AdminAnalysisHandler # Post Method # Upload File Name # No Selected File')
         self.write(json.dumps({'id':'0'}))
      else:
         if original_fname!='':
            path = UPLOAD_FOLDER+original_fname
            file = self.request.files['file'][0]
            fh = open(path, 'wb')
            fh.write(file['body'])  
            fh.close()
                        
         analysis = {}
         analysis['script'] = self.get_argument('script','');
         analysis['action'] = self.get_argument('action','');
         analysis['entryprice'] = self.get_argument('entryprice','');
         analysis['stoploss'] = self.get_argument('stoploss','');
         analysis['target']=self.get_argument('target','');
         analysis['calldate']=self.get_argument('calldate','');
         analysis['comments']=self.get_argument('comments','');
         analysis['status']=self.get_argument('status','');
         analysis['analysisimage']=original_fname

         db = TinyDB(DB_FOLDER)
         table=db.table('analysis')
         analysisid = 0
         if eid > 0:
            print('AdminAnalysisHandler # Post Method # Updating Analysis with ID :',eid)
            if(original_fname==''):
               analysis['analysisimage']=self.get_argument('filename','');            
            analysisid = table.update(analysis, eids=[eid])  
         else :
            print('AdminAnalysisHandler # Post Method # Inserting Analysis #',analysis)
            analysisid = table.insert(analysis);

      filename=''
      if(original_fname==''):
         filename=self.get_argument('filename','')
      else:
         filename=original_fname
      returned_data={}
      returned_data['id'] = analysisid
      returned_data['filename'] = filename
      self.write(json.dumps(returned_data))

   def get(self):
      if not self.get_secure_cookie("user"):
         self.render('static/index_login.html')
         return

      db = TinyDB(DB_FOLDER)
      table=db.table('analysis')
      analysis_call =table.all()

      analysis_list = list()
      for item in analysis_call:
         data = json.dumps(item)
         data_obj = json.loads(data)
         data_obj['eid'] = item.eid
         analysis_list.append(data_obj)

      returned_data = {}
      returned_data['data']=analysis_list
      #print('AdminAnalysisHandler # Get Method # Analysis Calls # ', returned_data)
      self.write(json.dumps(returned_data))

class StockstrendBuyIndiacator(tornado.web.RequestHandler):
   def post(self):
      indicator = {}
      indicator['form-name'] = self.get_argument('form-name','');
      indicator['form-email'] = self.get_argument('form-email','');
      indicator['form-contact'] = self.get_argument('form-contact','');
      indicator['form-bank'] = self.get_argument('form-bank','');
      indicator['form-transaction-no']=self.get_argument('form-transaction-no','');
      indicator['form-transaction-date']=self.get_argument('form-transaction-date','');
      
      db = TinyDB(DB_FOLDER)
      table=db.table('indicator')
      table.insert(indicator);
      self.write(json.dumps({'status':'success'}))

class StockstrendRegistration(tornado.web.RequestHandler):
   def post(self):
      registration = {}
      registration['form-name'] = self.get_argument('form-name','');
      registration['form-email'] = self.get_argument('form-email','');
      registration['form-contact'] = self.get_argument('form-contact','');
      registration['form-bank'] = self.get_argument('form-bank','');
      registration['form-transaction-no']=self.get_argument('form-transaction-no','');
      registration['form-transaction-date']=self.get_argument('form-transaction-date','');
      
      db = TinyDB(DB_FOLDER)
      table=db.table('registration')
      table.insert(registration);
      self.write(json.dumps({'status':'success'}))

class StockstrendSendMessage(tornado.web.RequestHandler):
   def post(self):
      message = {}
      message['name'] = self.get_argument('name','');
      message['email'] = self.get_argument('email','');
      message['message'] = self.get_argument('message','');
      
      db = TinyDB(DB_FOLDER)
      table=db.table('message')
      table.insert(message);
      self.write(json.dumps({'status':'success'}))


class StockstrendAnalysisHandler(tornado.web.RequestHandler):
   def get(self):
      db = TinyDB(DB_FOLDER)
      table=db.table('analysis')
      Calls = Query()
      analysis_call=table.search(Calls.status=='A')
      
      analysis_list = list()
      analysis_list.append(analysis_call[0])
      #print('StockstrendAnalysisHandler # Get Method # Analysis Call # ', analysis_list)
      self.write(json.dumps(analysis_list))

class StockstrendCallPerformanceHandler(tornado.web.RequestHandler):
   def get(self):
      db = TinyDB(DB_FOLDER)
      table=db.table('weeklycalls')
      Calls = Query()
      expired_call=table.search(Calls.status=='E')
      
      sorted_calls = sorted(expired_call, key=lambda x: datetime.strptime(x['date'], '%d/%m/%Y'))
      
      #Get todays date
      today = dt.date.today()
      #Last Monday  : today - datetime.timedelta(days=today.weekday())
      # Previous Week Monday : today - datetime.timedelta(days=today.weekday(),weeks=1)
      # We will get the both the Sunday hence adding one more day to subtract
      lastSunday = today - dt.timedelta(days=today.weekday()+1)
      previousSunday = today - dt.timedelta(days=today.weekday()+1,weeks=1)

      filtered_calls = list()
      for call in sorted_calls:
         calldate = datetime.strptime(call['date'], '%d/%m/%Y').date()
         if previousSunday <= calldate <= lastSunday:
            filtered_calls.append(call)
         
      print('StockstrendCallPerformanceHandler # Get Method # Performance Calls # ', filtered_calls)
      self.write(json.dumps(filtered_calls))
      
class IndexHandler(tornado.web.RequestHandler):
   def get(self):
      self.render("static/index.html")
 
def main():
   http_server = tornado.httpserver.HTTPServer(Application())
   http_server.listen(options.port)
   tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
   main()
