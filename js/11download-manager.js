function addDownload(path,name){
 $('#downloadDropdown').append($('<option></option>').val(path).html(name));
};
function clearDownloadDropdown(){
  $('#downloadDropdown').empty();
  addDownload('','Choose a product to download');
}
clearDownloadDropdown()
function downloadByUrl(url){
  print('downloading');
    print(url);
    var link=document.createElement('a');
    link.href = url;
    link.target = '_blank';
    var downloadName = url.substr(url.lastIndexOf('/') + 1);
    

    // link.download ='hello';// downloadName;
    link.setAttribute('download',downloadName);

    print(link)
    link.click();
    
    
    ga('send', 'event', 'lcms-download', 'download', downloadName);
    // var urlAux = url + '.aux.xml';
    // print(urlAux)
    // var downloadNameAux = url.substr(url.lastIndexOf('/') + 1)+'.aux.xml';
    // link=document.createElement('a');
    // link.href = urlAux;
    // link.download = downloadNameAux;
    // link.click();

    showMessage('Download Started','Your download of ' + downloadName + ' has started.');
    return downloadName
}
function downloadSelectedArea(id){
  if(id === undefined || id === null){id = downloadDropdown}
  var url = $('#'+id).val();
  if(url !== ''){
    downloadByUrl(url)
  }
}
function downloadSelectedAreas(id){
  var urls =  $('#'+id).val();
  if(urls !== ''){
    var downloadNames = urls.map(downloadByUrl);
    showMessage('Downloads Started','The following downloads have started:<hr> <li><ul class = "m-0">' + downloadNames.join('</ul><ul class = "m-0">') + '</ul></li>');
  }
  // var urlList = `<li>`

  
}
function downloadTutorial(){
  var link = document.createElement("a");
  link.href = './tutorials/LCMS_Data_Explorer_Overview_20200317.pdf';
    link.target = '_blank';
  link.click();
  // link.setAttribute("download", filename);
}