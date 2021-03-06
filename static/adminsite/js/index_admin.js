
var weeklycalldatatable
function weeklycalls(){
   if ( ! $.fn.DataTable.isDataTable( '#weeklycalltable') ) {
      weeklycalldatatable = $('#weeklycalltable').DataTable({
         "ajax": {
            "dataType": 'json',
            "contentType": "application/json",
            "type": "get",
            "url":"/admin/calls"
         },
         "columns": [
            { "data": "eid" },
            { "data": "script" },
            { "data": "action","render":function(data,type,full) {if(data=='B') { return 'Buy' } else {return 'Sell'}} },
            { "data": "entryprice" },
            { "data": "stoploss" },
            { "data": "target" },
            { "data": "date" },
            { "data": "status","render":function(data,type,full) {if(data=='A') { return 'Active' } else {return 'Expired'}}  },
            { "data": "result","render":function(data,type,full) {if(data=='P') { return 'Target Hit' } else if(data=='L') {return 'Stoploss Hit'} else if(data=='E') {return 'Position Closed'} else {return 'Ongoing-Call'}}  },
            { "data": "exitprice" },
            { "data": "", "render":function(data,type,full){return '<button> Edit </button>'}}
         ]
      })
   } else {
      weeklycalldatatable.ajax.reload();
   }

   $('#weeklycalltable tbody').on( 'click', 'button', function () {
        var data = weeklycalldatatable.row($(this).parents('tr')).data();
        console.log(data['eid'])
        populateweeklyCallformdata(data);
    });
}

function populateweeklyCallformdata(data){
   $.each(data, function(key, value) {  
      if(key=='eid') {
         var ctrl = $('[name=id]', $("#weeklyCallForm"));  
         ctrl.val(value);

      } else if(key=='date') {
         var ctrl = $('[name=calldate]', $("#weeklyCallForm"));  
         ctrl.val(value);

      }else {
         var ctrl = $('[name='+key+']', $("#weeklyCallForm"));  
         ctrl.val(value);  
      }  
    });
}

function clearweeklycallformhidden(){
   var ctrl = $('[name=id]', $("#weeklyCallForm"));  
   ctrl.val('0');
}

$(document).ready(function () {
   $("#weeklyCallForm").submit(function (event) {
      //disable the default form submission
      event.preventDefault();
      //grab all form data  
      var formData = new FormData($("#weeklyCallForm")[0]);
      $.ajax({
         url: '/admin/calls',
         type: 'post',
         data: formData,
         async: false,
         cache: false,
         contentType: false,
         processData: false,
         success: function(data) {
            response_data = $.parseJSON(data)
            //alert(JSON.stringify(response_data))
            //alert(response_data['id'])
            var ctrl = $('[name=id]', $("#weeklyCallForm"));  
            ctrl.val(response_data['id']);
            weeklycalldatatable.ajax.reload()
            alert("Success")
         },
         error:function(data){
            console.log(data)
            alert('Error Occured')
         }
      });
      return false;
   })
});

$(document).ready(function () {
   weeklycalls();
})

// Historical Datatable Load and Refresh Functions
//$(document).ready(function () {
var historicalcalldatatable
function loadhistoricalcalls(){
	if ( ! $.fn.DataTable.isDataTable( '#example') ) {
		historicalcalldatatable = $('#example').DataTable({
    		"ajax": {
        		"dataType": 'json',
        		"contentType": "application/json",
        		"type": "get",
        		"url":"/admin/historicalcalls"
    		},
    		"columns": [
        		{ "data": "eid" },
        		{ "data": "script" },
        		{ "data": "action","render":function(data,type,full) {if(data=='B') { return 'Buy' } else {return 'Sell'}} },
        		{ "data": "entryprice" },
        		{ "data": "stoploss" },
        		{ "data": "target" },
        		{ "data": "date" },
        		{ "data": "status","render":function(data,type,full) {if(data=='A') { return 'Active' } else {return 'Expired'}}  },
        		{ "data": "result","render":function(data,type,full) {if(data=='P') { return 'Target Hit' } else if(data=='E') {return 'Position Closed'} else {return 'Stoploss Hit'}}  },
            { "data": "exitprice" },
            { "data": "", "render":function(data,type,full){return '<button> Edit </button>'}}
        	]
  		})
	} else {
		historicalcalldatatable.ajax.reload();
	}

  $('#example tbody').on( 'click', 'button', function () {
        var data = historicalcalldatatable.row($(this).parents('tr')).data();
        console.log(data['eid'])
        populatehistoricalCallformdata(data);
    });
}

function populatehistoricalCallformdata(data){
   $.each(data, function(key, value) {  console.log(key+':'+value)
      if(key=='eid') {
         var ctrl = $('[name=id]', $("#historicalCallForm"));  
         ctrl.val(value);

      } else if(key=='date') {
         var ctrl = $('[name=calldate]', $("#historicalCallForm"));  
         ctrl.val(value);

      }else {
         var ctrl = $('[name='+key+']', $("#historicalCallForm"));  
         ctrl.val(value);  
      }  
    });
}

$(document).ready(function () {
   $("#historicalCallForm").submit(function (event) {
      //disable the default form submission
      event.preventDefault();

      var ctrl = $('[name=id]', $("#historicalCallForm"));  
      //alert(ctrl.val())
      if (ctrl.val().trim()=='0') {
        alert('Historical Calls can only be modified.')
        return false;
      }
      
      
      //grab all form data  
      var formData = new FormData($("#historicalCallForm")[0]);
      $.ajax({
         url: '/admin/calls',
         type: 'post',
         data: formData,
         async: false,
         cache: false,
         contentType: false,
         processData: false,
         success: function(data) {
            response_data = $.parseJSON(data)
            //alert(JSON.stringify(response_data))
            //alert(response_data['id'])
            var ctrl = $('[name=id]', $("#historicalCallForm"));  
            ctrl.val(response_data['id']);
            historicalcalldatatable.ajax.reload()
            alert("Success")
         },
         error:function(data){
            console.log(data)
            alert('Error Occured')
         }
      });
      return false;
   })
});

function previewImage(input) {
   var preview = document.getElementById('preview');
   if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        preview.setAttribute('src', e.target.result);
      }
      reader.readAsDataURL(input.files[0]);
   } else {
      preview.setAttribute('src', 'placeholder.png');
   }
}

$( function() {
   $( "#datepicker" ).datepicker();
});

$(document).on("focus", ".calldate",function(){
   //alert("1");
   $(this).find("input[type=hidden]").datepicker({
      changeMonth: true,
      changeYear: true,
      dateFormat: 'dd/mm/yy',
      showOn: "button",
      buttonImage: "images/calendar-icon.png",
      buttonImageOnly: true, onSelect: function() { },
      onClose: function(dateText, inst) { //alert(dateText)
         $(this).parent().find("[contenteditable=false]").html(dateText).blur();
         $(this).find(".ui-datepicker-trigger").css("visibility", "hidden");
      }
   });
});

var analysislistdatatable
//$(document).ready(function () {
function loadanalysis(){
	if ( ! $.fn.DataTable.isDataTable( '#analysislist') ) { 
  		analysislistdatatable = $('#analysislist').DataTable({
    		"ajax": {
        		"dataType": 'json',
        		"contentType": "application/json",
        		"type": "get",
        		"url":"/admin/analysis"
    		},
    		"columns": [
      			{ "data": "eid"},
      			{ "data": "script" },
      			{ "data": "action","render":function(data,type,full) {if(data=='B') { return 'Buy' } else {return 'Sell'}}  },
      			{ "data": "entryprice" },
      			{ "data": "stoploss" },
      			{ "data": "target" },
      			{ "data": "calldate" },
      			{ "data": "analysisimage"},
            { "data": "status","render":function(data,type,full) {if(data=='A') { return 'Active' } else {return 'Expired'}}  },
      			{ "data": "", "render":function(data,type,full){return '<button> Edit </button>'}}
    		]
  		});
  	} else { 
  		analysislistdatatable.ajax.reload()
  	}

  	$('#analysislist tbody').on( 'click', 'button', function () {
        var data = analysislistdatatable.row($(this).parents('tr')).data();
        console.log(data['eid'])
        populateformdata(data);
    });
}


$(document).ready(function () {
   $("#myForm").submit(function (event) {
      //disable the default form submission
      event.preventDefault();
      //grab all form data  
      var formData = new FormData($("#myForm")[0]);
      $.ajax({
         url: '/admin/analysis',
         type: 'post',
         data: formData,
         async: false,
         cache: false,
         contentType: false,
         processData: false,
         success: function(data) {
            response_data = $.parseJSON(data)
            var ctrl = $('[name=id]', $("#myForm"));  
            ctrl.val(response_data['id']);

            var ctrl = $('[name=filename]', $("#myForm"));  
            ctrl.val(response_data['filename']);

            analysislistdatatable.ajax.reload()
            alert("Success")
         },
         error:function(data){
            console.log(data)
            alert('Error Occured')
         }
      });
      return false;
   })
});


function populateformdata(data){
  	$.each(data, function(key, value) {  
  		if(key=='eid') {
         var ctrl = $('[name=id]', $("#myForm"));  
        	ctrl.val(value);

  		} else if(key=='analysisimage') {
  			d = new Date();
  			imgsrc = '/static/adminsite/uploadedimages/'+value;
			$("#preview").attr("src", imgsrc+"?"+d.getTime());
         var ctrl = $('[name=filename]', $("#myForm"));  
         ctrl.val(value);
  		} else {
  			var ctrl = $('[name='+key+']', $("#myForm"));  
        	ctrl.val(value);	
  		}  
    });
}

function clearpreview() {
   d = new Date();
   imgsrc = '';
   $("#preview").attr("src", imgsrc+"?"+d.getTime());
   var ctrl = $('[name=filename]', $("#myForm"));  
   ctrl.val('');
   ctrl = $('[name=id]', $("#myForm"));  
   ctrl.val('0');

}

$(document).ready(function () { //alert(1)
   $('#mainLeaderboard').find('#content1').show()
   $('#mainLeaderboard').find('#content1').addClass('active')
   //alert($('.innertube').find('#content1').text())
})

function toggle(id) { //alert(id)
   $('#mainLeaderboard').find('#content1').hide()
   $('#mainLeaderboard').find('#content2').hide()
   $('#mainLeaderboard').find('#content3').hide()
   $('#mainLeaderboard').find('#content4').hide()
   $('#mainLeaderboard').find('#content5').hide()
   $('#mainLeaderboard').find('#content6').hide()
   $('#mainLeaderboard').find('#content7').hide()

   if(id=='#content1')
      weeklycalls()
   else if(id=='#content2')
      loadhistoricalcalls()
   else if(id=='#content3')
      loadanalysis()
    else if(id=='#content4')
      loadregisteredusers()
    else if(id=="#content5")
      loadindicatorcustomer()
    else if(id=="#content6")
      loadmessages()
    else if(id=="#content7")
      loadindicatorfiles()
    else {
      //e.preventDefault()
      alert("Work in Progress")
      return false
   }
   $('#mainLeaderboard').find(id).show()
}

function logout() {
   $.ajax({
      url: '/logout',
      type: 'post',
      async: false,
      cache: false,
      contentType: false,
      processData: false,
      success: function(response_data) {
         $(location).attr('href', '/admin')
      },
      error:function(data){
         console.log(data)
         alert('Error Occured')
      }
   })
}

var registereduserdatatable
//$(document).ready(function () {
function loadregisteredusers(){
  if ( ! $.fn.DataTable.isDataTable( '#registeredusertable') ) { 
      registereduserdatatable = $('#registeredusertable').DataTable({
        "ajax": {
            "dataType": 'json',
            "contentType": "application/json",
            "type": "get",
            "url":"/admin/registration"
        },
        "columns": [
            { "data": "eid"},
            { "data": "form-name" },
            { "data": "form-email" },
            { "data": "form-contact" },
            { "data": "form-bank" },
            { "data": "form-transaction-no" },
            { "data": "form-transaction-date" },
            {"data": "registration_date"}
        ]
      });
    } else { 
      registereduserdatatable.ajax.reload()
    }
}


var indicatorcustomerdatatable
//$(document).ready(function () {
function loadindicatorcustomer(){
  if ( ! $.fn.DataTable.isDataTable( '#indicatorcustomertable') ) { 
      indicatorcustomerdatatable = $('#indicatorcustomertable').DataTable({
        "ajax": {
            "dataType": 'json',
            "contentType": "application/json",
            "type": "get",
            "url":"/admin/indicator"
        },
        "columns": [
            { "data": "eid"},
            { "data": "form-name" },
            { "data": "form-email" },
            { "data": "form-contact" },
            { "data": "form-bank" },
            { "data": "form-transaction-no" },
            { "data": "form-transaction-date" },
            {"data": "buy_date"}
        ]
      });
    } else { 
      indicatorcustomerdatatable.ajax.reload()
    }
}

var messagedatatable
//$(document).ready(function () {
function loadmessages(){
  if ( ! $.fn.DataTable.isDataTable( '#msgtable') ) { 
      messagedatatable = $('#msgtable').DataTable({
        "ajax": {
            "dataType": 'json',
            "contentType": "application/json",
            "type": "get",
            "url":"/admin/msg"
        },
        "columns": [
            { "data": "eid"},
            { "data": "name" },
            { "data": "email" },
            { "data": "message" },
            {"data" : "msgdate"}
        ]
      });
    } else { 
      messagedatatable.ajax.reload()
    }
}

var indicatorFilesdatatable
//$(document).ready(function () {
function loadindicatorfiles(){
  if ( ! $.fn.DataTable.isDataTable( '#indicatorlist') ) { 
      indicatorFilesdatatable = $('#indicatorlist').DataTable({
        "ajax": {
            "dataType": 'json',
            "contentType": "application/json",
            "type": "get",
            "url":"/admin/indicatorfiles"
        },
        "columns": [
            { "data": "eid"},
            { "data": "filename" },
            { "data": "url" },
            { "data": "date" },
            { "data": "", "render":function(data,type,full){return '<button> Delete </button>'}}
        ]
      });
    } else { 
      indicatorFilesdatatable.ajax.reload()
    }

    $('#indicatorlist tbody').on( 'click', 'button', function () {
        var data = indicatorFilesdatatable.row($(this).parents('tr')).data();
        console.log(data['eid'])
        deleteindicatorfile(data);
    });
}

$(document).ready(function () {
   $("#uploadForm").submit(function (event) {
      //disable the default form submission
      event.preventDefault();
      //grab all form data  
      var formData = new FormData($("#uploadForm")[0]);
      $.ajax({
         url: '/admin/indicatorfiles',
         type: 'post',
         data: formData,
         async: false,
         cache: false,
         contentType: false,
         processData: false,
         success: function(data) {
            response_data = $.parseJSON(data)

            console.log(response_data)
            var id = response_data['id'];

            if(id=='0')
              alert("Please select a file to upload")
            else {
              $("#uploadForm")[0].reset()
              indicatorFilesdatatable.ajax.reload()
              alert("Success")
            }
         },
         error:function(data){
            console.log(data)
            alert('Error Occured')
         }
      });
      return false;
   })
});

function deleteindicatorfile(data) {
  $.ajax({
     url: '/admin/indicatorfiles?id='+data['eid']+'&filename='+data['filename'],
     type: 'put',
     async: false,
     cache: false,
     contentType: false,
     processData: false,
     success: function(data) {
        response_data = $.parseJSON(data)

        console.log(response_data)
        $("#uploadForm")[0].reset()
        indicatorFilesdatatable.ajax.reload()
        alert("Success")
      
     },
     error:function(data){
        console.log(data)
        alert('Error Occured')
     }
  });
  return false;
}


