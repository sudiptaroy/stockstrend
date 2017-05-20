  // Offset for Site Navigation
$('#siteNav').affix({
  	offset: {
  		top: 100
  	}
})
  
$('#footernav').affix({
  	offset: {
  		bottom: 0
  	}
})

function weeklycalls(){
   $.ajax({
      url: '/calls',
      type: 'get',
      contentType: "application/json",
      success: function(data){ 
         response_data = $.parseJSON(data)
         //alert(JSON.stringify(response_data));
         innerHTML ="";
         liHTML="</br></br></br></br>"
         $.each(response_data['data'], function(key,value){ //alert("loop")
            innerHTML = '<li style="text-align:left;"><button class="';
            if(value.action=='B') {
               innerHTML=innerHTML+'btn-success" style="width:50px;margin-right:10px">BUY</button>'
            } else {
               innerHTML=innerHTML+'btn-danger" style="width:50px;margin-right:10px">SELL</button>'
            }

            innerHTML=innerHTML+value.script+'<br> Entry Price - '+value.entryprice
            innerHTML=innerHTML+'<br> Target - '+value.target
            innerHTML=innerHTML+'<br> Stoploss - '+value.stoploss
            innerHTML=innerHTML+'</li>'

            liHTML=liHTML+innerHTML
         })
         console.log(liHTML)
         $('.scrolling-div-content').append(liHTML)
        
         //Scrolling related javascript
         $.fn.rollup = function ( options ) {
            var settings = $.extend( {
               $wrapper : this,
               $content : $('.scrolling-div-content'),
               speed : 5000
            }, options);
          
            return this.each( function(){
               var $content = settings.$content,
               $content_height = $content.height(),
               $wrapper = settings.$wrapper,
               $wrapper_height = $wrapper.height(),
               $clone = $content.clone(),
               $merge = $.merge( $content, $clone );
              
               //$wrapper.append( $clone );
               function rollUp () {
                  $merge.animate({
                     top : -( $content_height ),
                  }, settings.speed, 'linear', function () {
                     $merge.css({
                        top : 0
                     });
                     rollUp();
                  });
               }
               rollUp();
            });
         };
  
         $('.scrolling-div').rollup({speed:20000});
         $('.scrolling-div').hover(function() {
            $('.scrolling-div-content').stop(true,false);
         }, function() {
            $('.scrolling-div').rollup({speed:20000});
         });
      },
      error:function(data){
         alert("Error:"+data);
      }
   })
}

function lastweekperformance() {
   $.ajax({
      url: '/lastweekcalls',
      type: 'get',
      contentType: "application/json",
      success: function(data){ 
         response_data = $.parseJSON(data)
         //alert(JSON.stringify(response_data))
         preformanceHTML=""           
         $.each(response_data, function(key,value){
            divHTML = '<div class="tr">'   
            divHTML = divHTML+'<div class="td stock accordion-xs-toggle" style="text-align:left"><button class="'
            if(value.action=='B') {
               divHTML=divHTML+'btn-success" style="width:40px;margin-right:10px">Buy</button>'
            } else {
               divHTML=divHTML+'btn-danger" style="width:40px;margin-right:10px">Sell</button>'
            }

            divHTML=divHTML+value.script+'</div>'
            divHTML=divHTML+'<div class="accordion-xs-collapse">'
            divHTML=divHTML+'<div class="inner">'
            divHTML=divHTML+'<div class="td stdate">'+value.date+'</div>'
            divHTML=divHTML+'<div class="td stentry">'+value.entryprice+'</div>'
            divHTML=divHTML+'<div class="td ststoploss">'+value.stoploss+'</div>'
            divHTML=divHTML+'<div class="td sttarget">'+value.target+'</div>'
            if(value.result=='P') {
               divHTML=divHTML+'<div class="td ststatus btn-success">Target Hit</div>'
            } else if(value.result=='L') {
               divHTML=divHTML+'<div class="td ststatus btn-danger">Stoploss Hit</div>'
            } else if(value.result=='E') {
                if(parseInt(value.exitprice) > parseInt(value.entryprice))
                  divHTML=divHTML+'<div class="td ststatus btn-success">Position Closed</div>'
                else
                  divHTML=divHTML+'<div class="td ststatus btn-danger">Position Closed</div>'
            } else {
               divHTML=divHTML+'<div class="td ststatus btn-success">Ongoing</div>'
            }
            if(value.action=='B') {
               if(value.result=='P') {
                  divHTML=divHTML+'<div class="td stgain btn-success">'+ (parseInt(value.target) - parseInt(value.entryprice)) +'</div>'
               } else if(value.result=='L') {
                  divHTML=divHTML+'<div class="td stgain btn-danger">'+ ( parseInt(value.entryprice)- parseInt(value.stoploss))+'</div>'
               } else if(value.result=='E') {
                  if(parseInt(value.exitprice) > parseInt(value.entryprice))
                     divHTML=divHTML+'<div class="td stgain btn-success">'+ (parseInt(value.exitprice) - parseInt(value.entryprice)) +'</div>'
                  else
                     divHTML=divHTML+'<div class="td stgain btn-danger">'+ ( parseInt(value.entryprice)- parseInt(value.exitprice))+'</div>'
               }
            } else {
               if(value.result=='P') {
                  divHTML=divHTML+'<div class="td stgain btn-success">'+ ( parseInt(value.entryprice)-parseInt(value.target)) +'</div>'
               } else if(value.result=='L') {
                  divHTML=divHTML+'<div class="td stgain btn-danger">'+ ( parseInt(value.stoploss) - parseInt(value.entryprice))+'</div>'
               } else if(value.result=='E') {
                  if(parseInt(value.exitprice) < parseInt(value.entryprice))
                     divHTML=divHTML+'<div class="td stgain btn-success">'+ (parseInt(value.entryprice)-parseInt(value.exitprice)) +'</div>'
                  else
                     divHTML=divHTML+'<div class="td stgain btn-danger">'+ ( parseInt(value.exitprice)-parseInt(value.entryprice))+'</div>'
               }
            }
            divHTML=divHTML+'</div></div></div>'
            console.log(divHTML)
            preformanceHTML=preformanceHTML+divHTML
         })
         preformanceHTML=preformanceHTML+'<p style="text-align:center;"><a href="#" rel="modal:close" >Close</a></p>'
         $('#performancediv').append(preformanceHTML)

         $(function() {    
            var isXS = false,
            $accordionXSCollapse = $('.accordion-xs-collapse');
  
            // Window resize event (debounced)
            var timer;
            $(window).resize(function () {
               if (timer) { clearTimeout(timer); }
               timer = setTimeout(function () {
                  isXS = Modernizr.mq('only screen and (max-width: 767px)');
              
                  // Add/remove collapse class as needed
                  if (isXS) {
                     $accordionXSCollapse.addClass('collapse');               
                  } else {
                     $accordionXSCollapse.removeClass('collapse');
                  }
               }, 100);
            }).trigger('resize'); //trigger window resize on pageload    
      
            // Initialise the Bootstrap Collapse
            $accordionXSCollapse.each(function () {
               $(this).collapse({ toggle: false });
            });      
      
            // Accordion toggle click event (live)
            $(document).on('click', '.accordion-xs-toggle', function (e) {
               e.preventDefault();
          
               var $thisToggle = $(this),
               $targetRow = $thisToggle.parent('.tr'),
               $targetCollapse = $targetRow.find('.accordion-xs-collapse');            
         
               if (isXS && $targetCollapse.length) { 
                  var $siblingRow = $targetRow.siblings('.tr'),
                  $siblingToggle = $siblingRow.find('.accordion-xs-toggle'),
                  $siblingCollapse = $siblingRow.find('.accordion-xs-collapse');
              
                  $targetCollapse.collapse('toggle'); //toggle this collapse
                  $siblingCollapse.collapse('hide'); //close siblings
              
                  $thisToggle.toggleClass('collapsed'); //class used for icon marker
                  $siblingToggle.removeClass('collapsed'); //remove sibling marker class
               }
            });
         });
      },
      error:function(error_data) {
         alert('error occured')
      }
   })
}

function analysiscall() {
   $.ajax({
      url: '/analysis',
      type: 'get',
      contentType: "application/json",
      success: function(data){ 
         response_data = $.parseJSON(data)
         //alert(JSON.stringify(response_data))
         $.each(response_data, function(key,value){
            divHTML = '<div class="col-md-5 m20">'   
            divHTML = divHTML+'<table id="sampleanalysis">'
            divHTML = divHTML+'<tr class="row ouranalysis">'
            divHTML = divHTML+'<td class="col-sm-2">Security:</td>'
            divHTML = divHTML+'<td class="col-sm-10">'+value.script+'</td>'
            divHTML = divHTML+'</tr>'
            divHTML = divHTML+'<tr class="row ouranalysis">'
            divHTML = divHTML+'<td class="col-sm-2">Comment:</td>'
            divHTML = divHTML+'<td class="col-sm-10">'+value.comments+'</td>'
            divHTML = divHTML+'</tr>'
            divHTML = divHTML+'<tr class="row ouranalysis">'
            divHTML = divHTML+'<td class="col-sm-2">Action:</td>'

            if(value.action=='B'){
               divHTML = divHTML+'<td class="col-sm-10">Buy above '+value.entryprice+'</td>'
            } else {
               divHTML = divHTML+'<td class="col-sm-10">Sell below '+value.entryprice+'</td>'
            }
            
            divHTML = divHTML+'</tr>'
            divHTML = divHTML+'<tr class="row ouranalysis">'
            divHTML = divHTML+'<td class="col-sm-2">Targets:</td>'
            divHTML = divHTML+'<td class="col-sm-10">'+value.target+'</td>'
            divHTML = divHTML+'</tr>'
            divHTML = divHTML+'<tr class="row ouranalysis">'
            divHTML = divHTML+'<td class="col-sm-2">Stoploss:</td>'
            divHTML = divHTML+'<td class="col-sm-10">'+value.stoploss+'</td>'
            divHTML = divHTML+'</tr>'
            divHTML = divHTML+'</table>'
            divHTML = divHTML+'</div>'
            divHTML = divHTML+'<div class="col-md-7" id="chartimg">'
            imgsrc = '/static/adminsite/uploadedimages/'+value.analysisimage
            divHTML = divHTML+'<div style="width:100%"><img src="'+imgsrc+'"/></div>'
            divHTML = divHTML+'</div>'


            console.log(divHTML)
            $('#analysisdiv').append(divHTML)
            
         })
      },
      error:function(error_data) {
         alert('error occured')
      }
   })
}

function getcurrentweek() {
  var curr = new Date; // get current date
  //alert(curr.getDay())

  var first
  if(curr.getDay()>5) 
    first = curr.getDate() + (8-curr.getDay()) 
  else
    first = curr.getDate() - (curr.getDay()-1);
  
  // First day is the day of the month - the day of the week
  var last = first + 4; // last day is the first day + 6
  var firstday = new Date(curr.setDate(first));
  curr = new Date()
  var lastday = new Date(curr.setDate(last));
  
  firstdayStr = firstday.getDate()+'/'+(firstday.getMonth()+1)+'/'+firstday.getFullYear()
  lastdayStr = lastday.getDate()+'/'+(lastday.getMonth()+1)+'/'+lastday.getFullYear()

  weekdates='Weekly Calls('+firstdayStr+' - '+lastdayStr+')'
  $('#weeklycalldate').text(weekdates)

} 

$(document).ready(function () {
   weeklycalls();
   lastweekperformance();
   analysiscall();
   getcurrentweek();
})

  //Fancy box setup for Contact US
  function validateEmail(email) { 
      var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return reg.test(email);
  }
  
  $(document).ready(function() {
      $("#modalbox").fancybox();
      $("#contact").submit(function() { return false; });
  
  
      $("#send").on("click", function(){
          var emailval  = $("#email").val();
          var msgval    = $("#msg").val();
          var msglen    = msgval.length;
          var mailvalid = validateEmail(emailval);
  
          if(mailvalid == false) {
              $("#email").addClass("error");
          }
          else if(mailvalid == true){
              $("#email").removeClass("error");
          }
  
          if(msglen < 4) {
              $("#msg").addClass("error");
          }
          else if(msglen >= 4){
              $("#msg").removeClass("error");
          }
  
          if(mailvalid == true && msglen >= 4) {
              // if both validate we attempt to send the e-mail
              // first we hide the submit btn so the user doesnt click twice
              $("#send").replaceWith("<em>sending...</em>");
  
              $.ajax({
                  type: 'POST',
                  url: 'sendmessage.php',
                  data: $("#contact").serialize(),
                  success: function(data) {
                      if(data == "true") {
                          $("#contact").fadeOut("fast", function(){
                              $(this).before("<p><strong>Success! Your feedback has been sent, thanks :)</strong></p>");
                              setTimeout("$.fancybox.close()", 1000);
                          });
                      }
                  }
              });
          }
      });
  });
  
  
function navigation(element) {
   //$(".header-content").hide();
   $('#introduction').hide();
  	$('#training').hide();
  	$('#indicator').hide();
  	$('#contactus').hide();
  	$('#disclaimer').hide();
  	
  	$('#li_home').removeClass("active disabled");
  	$('#li_training').removeClass("active disabled");
  	$('#li_indicator').removeClass("active disabled");
  	$('#li_contactus').removeClass("active disabled");
  	
  	$('#li_'+element).addClass("active");
  	
  	if(element=='home') {
  	   //$(".header-content").show()
  	   location.href="#"
  	} else {
  	   $('#'+element).show();
  	   var url = location.href;               //Save down the URL without hash.
      location.href = "#"+element;                 //Go to the target element.
      history.replaceState(null,null,url);    
  	}	
    
   if($('#navbar').hasClass("in")) {
      $('#navbar').removeClass("in");
   }
}
  
function toggleindicator(element) {
   navigation('indicator');
   $('#longtermindicator').hide();
   $('#shorttermindicator').hide();
   $('#intradayindicator').hide();
   $('#'+element).show();
}

$(function() {
   $('#indicator-form').on('submit', function(ev){
      ev.preventDefault();
   //$('.buyindicator').on('click', function(e) {
    //  e.preventDefault();
      var formData = new FormData($("#indicator-form")[0]);
      $.ajax({
         url: '/buyindicator',
         type: 'post',
         data: formData,
         async: false,
         cache: false,
         contentType: false,
         processData: false,
         success: function(data) {
            response_data = $.parseJSON(data)
            $('#msgindicator').text("Success")
            $('#msgindicator').css("color","#23c619")
            //alert("Success1")
         },
         error:function(data){
            response_data = $.parseJSON(data)
            $('#msgindicator').text("Error")
            $('#msgindicator').css("color","Red")
            console.log(data)
            alert('Error Occured')
         }
      });
    return false;
   });
});

$(function() {
    $('#registration-form').on('submit', function(ev){
      ev.preventDefault();

   //$('.register').on('click', function(e) {
      //e.preventDefault();
      var formData = new FormData($("#registration-form")[0]);
      $.ajax({
         url: '/register',
         type: 'post',
         data: formData,
         async: false,
         cache: false,
         contentType: false,
         processData: false,
         success: function(data) {
            response_data = $.parseJSON(data)
            $('#msgregsiter').text("Success")
            $('#msgregsiter').css("color","#23c619")
            //alert(response_data.status)
         },
         error:function(data){
            response_data = $.parseJSON(data)
            $('#msgregsiter').text("Error")
            $('#msgregsiter').css("color","Red")
            console.log(data)
            //alert('Error Occured')
         }
      });
    return false;
   });
});

$(function() {
   $('#sendmsg').on('click', function(e) {
      e.preventDefault();
      var formData = new FormData($("#sendmsg-form")[0]);
      $.ajax({
         url: '/sendmsg',
         type: 'post',
         data: formData,
         async: false,
         cache: false,
         contentType: false,
         processData: false,
         success: function(response_data) {
            alert("Thank you for sending message to us.")
         },
         error:function(data){
            console.log(data)
            alert('Error Occured')
         }
      });
    return false;
   });
});
/*
function formsubmit(){
   alert( $("#indicator-form input[name=form-name]").val() );
   alert('submit')
   $('#buyindicatorclose').click()
    
}

//Registration Modal Window
$(function(){
  $('#indicator-form').submit(function(e){
    alert("Submit form")
    
  });
})
*/ 
