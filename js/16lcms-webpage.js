
function addModal(containerID,modalID,bodyOnly){
    if(bodyOnly === null || bodyOnly === undefined){
        bodyOnly = false};
    if(containerID === null || containerID === undefined){containerID = 'main-container'};
    if(modalID === null || modalID === undefined){modalID = 'modal-id'};
    $('#'+modalID).remove();
    if(bodyOnly){
    $('#'+ containerID).append(`<div id = "${modalID}" class="modal fade " role="dialog">
                <div class="modal-dialog modal-md ">
                <div class="modal-content modal-content-not-full-screen-styling">
                    <div style = ' border-bottom: 0 none;'class="modal-header pb-0" id ="${modalID}-header">
                    <button style = 'float:right;' id = 'close-modal-button' type="button" class="close text-dark" data-dismiss="modal">&times;</button>
                    </div>
                <div id ="${modalID}-body" class="modal-body " ></div>
                </div>
            </div> 
            </div>`
            );
    }else{
    $('#'+ containerID).append(`
            <div id = "${modalID}" class="modal fade " role="dialog">
                <div class="modal-dialog modal-lg ">
                <div class="modal-content bg-black">
                <button type="button" class="close p-2 ml-auto" data-dismiss="modal">&times;</button>
                    <div class="modal-header py-0" id ="${modalID}-header"></div>
                <div id ="${modalID}-body" class="modal-body " style = 'background:#DDD;' ></div>
                    <div class="modal-footer" id ="${modalID}-footer"></div>
                </div>
            </div> 
            </div>`
            );
    }
    }

function addModalTitle(modalID,title){
  if(modalID === null || modalID === undefined){modalID = 'modal-id'};
    $('#'+modalID+' .modal-header').prepend(`<h4 class="modal-title" id = '${modalID}-title'>${title}</h4>`);
  }

function clearModal(modalID){
  if(modalID === null || modalID === undefined){modalID = 'modal-id'};
  // $('#'+modalID).empty();

$('#'+modalID+'-title .modal-title').html('')
$('#'+modalID+'-header').html('');
$('#'+modalID+'-body').html('');
$('#'+modalID+'-footer').html('');
$('.modal').modal('hide');
$('.modal-backdrop').remove()
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to plae a message in a BS modal and show it
function showMessage(title,message,modalID,show){
  if(title === undefined || title === null){title = ''}
  if(message === undefined || message === null){message = ''}
  if(show === undefined || show === null){show = true}
  if(modalID === undefined || modalID === null){modalID = 'error-modal'}

clearModal(modalID);
addModal('main-container',modalID,true);
  if(title !== '' && title !== undefined && title !== null){
      addModalTitle(modalID,title);
  }

$('#'+modalID+'-body').append(message);
if(show){$('#'+modalID).modal();}
};
function appendMessage2(message,modalID){
  if(message === undefined || message === null){message = ''}
  if(modalID === undefined || modalID === null){modalID = 'error-modal'}
  $('#'+modalID+'-body').append(message);
  };
//////////////////////////////////////////////////////////////////////////////////////////////
function populateLCMSDownloads(){
  var toggler = document.getElementsByClassName("caret");
  var i;

  for (i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function() {
      // console.log(this)
      this.parentElement.querySelector(".nested").classList.toggle("active");
      // this.parentElement.querySelector(".nested").classList.toggle("treeOff");
      this.classList.toggle("caret-down");
      // this.classList.toggle("treeOff");
    });
  }
}
populateLCMSDownloads();

function downloadByUrl(url){
  console.log('downloading');
    console.log(url);
    var link=document.createElement('a');
    link.href = url;
    link.target = '_blank';
    var downloadName = url.substr(url.lastIndexOf('/') + 1);
    

    // link.download ='hello';// downloadName;
    link.setAttribute('download',downloadName);

    console.log(link)
    link.click();
    
    showMessage('Download Started','Your download of ' + downloadName + ' has started.');
    
    

    return downloadName
}

function downloadSelectedAreas(id){
  var urls =  $('#'+id).val();
  if(urls !== ''){
    console.log(urls)
    var downloadNames = urls.map(downloadByUrl);
    var message = '<li class = "m-0">';
    urls.map(function(url){
      var downloadName = url.substr(url.lastIndexOf('/') + 1);
      message += `<ul class = "m-0"><a href = "${url}" target = "_blank">${downloadName}</a></ul>`
    })
    message += '</li>'
    showMessage('Downloads Started','The following downloads have started. If you have a popup blocker, you may need to manually download the files by clicking on the links below:<hr>' + message + '</ul></li>');
    // setTimeout(()=>{
      showSurveyModal('downloadedLCMSTif',true);
    // },2000)
  }
}

$(document).ready(function() {
  // Add smooth scrolling to all links in navbar + footer link
  $(".navbar a, footer a[href='#myPage']").on('click', function(event) {
    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();
      // Store hash
      var hash = this.hash;
      // Using jQuery's animate() method to add smooth page scroll
      // The optional number (900) specifies the number of milliseconds it takes to scroll to the specified area
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 900, function() {
        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = hash;
      });
    } // End if
  });
  $(window).scroll(function() {
    $(".slideanim").each(function() {
      var pos = $(this).offset().top;
      var winTop = $(window).scrollTop();
      if (pos < winTop + 600) {
        $(this).addClass("slide");
      }
    });
  });
})
$('.carousel').carousel({
  interval: 8000
})
