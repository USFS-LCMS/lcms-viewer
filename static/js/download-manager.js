function addDownload(path,name){
 $('#downloadDropdown').append($('<option></option>').val(path).html(name));
};
function clearDownloadDropdown(){
  $('#downloadDropdown').empty();
  addDownload('','Choose a download');
}
function downloadSelectedArea(){
  var url = $('#downloadDropdown').val();
  if(url !== ''){
    print('downloading');
    print(url);
    var link=document.createElement('a');
    link.href = url;
    var downloadName = url.substr(url.lastIndexOf('/') + 1);
    link.download = downloadName;
    link.click();
    // showMessage('Success!','Successfully downloaded ' + downloadName);
  }
}