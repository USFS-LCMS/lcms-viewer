function addDownload(path,name){
 $('#downloadDropdown').append($('<option></option>').val(path).html(name));
};
function clearDownloadDropdown(){
  $('#downloadDropdown').empty();
  addDownload('','Choose a product to download');
}
clearDownloadDropdown()
function downloadSelectedArea(){
  var url = $('#downloadDropdown').val();
  if(url !== ''){
    print('downloading');
    print(url);
    var link=document.createElement('a');
    link.href = url;
    var downloadName = url.substr(url.lastIndexOf('/') + 1);
    

    // link.download ='hello';// downloadName;
    // link.setAttribute('download',downloadName);

    print(link)
    link.click();

    var urlAux = url + '.aux.xml';
    print(urlAux)
    var downloadNameAux = url.substr(url.lastIndexOf('/') + 1)+'.aux.xml';
    // link=document.createElement('a');
    // link.href = urlAux;
    // link.download = downloadNameAux;
    // link.click();

    showTip('SUCCESS','Your download of ' + downloadName + ' should complete shortly!');
  }
}