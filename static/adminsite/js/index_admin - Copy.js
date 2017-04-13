var $TABLE = $('#table');
var $BTN = $('#export-btn');
var $EXPORT = $('#export');

var remove_selected_row=[]

$('.table-add').click(function () {
   var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
   $TABLE.find('table').append($clone);
});

$('.table-remove').click(function () {
   var $td = $(this).parents('tr').find('td')
   var id = $td.eq(0).text()
   var selected_item = {}
   selected_item['id'] = id

   if(id > 0) {
      remove_selected_row.push(selected_item)
   }

   $(this).parents('tr').detach();
});

$('.table-up').click(function () {
   var $row = $(this).parents('tr');
   if ($row.index() === 1) return; // Don't go above the header
   $row.prev().before($row.get(0));
});

$('.table-down').click(function () {
   var $row = $(this).parents('tr');
   $row.next().after($row.get(0));
});

// A few jQuery helpers for exporting only
jQuery.fn.pop = [].pop;
jQuery.fn.shift = [].shift;

function weeklycalls(){
   $.ajax({
      url: '/admin/calls',
      type: 'get',
      contentType: "application/json",
      success: function(data){ 
         response_data = $.parseJSON(data)
         //alert(JSON.stringify(response_data));
         innerHTML ="";
         $.each(response_data, function(key,value){ //alert("loop")
            var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
            $td = $clone.find('td')
            //alert($td.eq(2).find("select").eq(0).val())
            $td.eq(0).text(value.eid)
            $td.eq(1).text(value.script)
            $td.eq(2).find('select').eq(0).val(value.action) //('selectedindex',1)
            $td.eq(3).text(value.entryprice)
            $td.eq(4).text(value.stoploss)
            $td.eq(5).text(value.target)
            $td.eq(6).find("[contenteditable=false]").html(value.date)
            $td.eq(7).find('select').eq(0).val(value.status) 
            $td.eq(8).find('select').eq(0).val(value.result) 
            $TABLE.find('table').append($clone);
         })
      },
      error:function(data){
         alert("Error:"+data);
      }
   })
}

$BTN.click(function () {
   var $rows = $TABLE.find('tr:not(:hidden)');
   var headers = [];
   var data = [];
  
   // Get the headers (add special header logic here)
   $($rows.shift()).find('th:not(:empty)').each(function () {
      headers.push($(this).text().toLowerCase());
   });
  
   // Turn all existing rows into a loopable array
   $rows.each(function () {
      var $td = $(this).find('td');
      var h = {};
    
      // Use the headers from earlier to name our hash keys
      headers.forEach(function (header, i) { 
         if(i==2 || i==7 || i==8) { 
            h[header] = $td.eq(i).find('select').eq(0).val().trim();  
         } else { 
            h[header] = $td.eq(i).text().trim();   
         } 
      });
      data.push(h);
   });

   // Output the result
   //$EXPORT.text(JSON.stringify(data));
   //alert(JSON.stringify(remove_selected_row))
   var post_data = {
      insert_item:JSON.stringify(data),
      remove_item:JSON.stringify(remove_selected_row)
   }

   $.ajax({
      url: '/admin/calls',
      type: 'put',
      data: JSON.stringify(post_data) , //JSON.stringify({ 'active': 'True', 'Credits': '100'}),
      contentType: "application/json",
      success: function(data){
         alert('success')
      },
      error: function(data){
         alert('error occured')
      }
   })
});

$(document).ready(function () {
   weeklycalls();
})

// Historical Datatable Load and Refresh Functions
//$(document).ready(function () {
var historicalcalldatatable
$('#tab2').on('focus', function(){
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
        		{ "data": "result","render":function(data,type,full) {if(data=='P') { return 'Target Hit' } else {return 'Stoploss Hit'}}  }
        	]
  		})
	} else {
		historicalcalldatatable.ajax.reload();
	}
})

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
$('#tab3').on('focus', function(){
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
})


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
         success: function(response_data) {
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

   $('#mainLeaderboard').find(id).show()
   $('#mainLeaderboard').find(id).addClass('active')
}





