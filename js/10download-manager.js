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
    
    
    ga('send', 'event',mode+'-download', 'image-download', downloadName);
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
    var message = '<li class = "m-0">';
    urls.map(function(url){
      var downloadName = url.substr(url.lastIndexOf('/') + 1);
      message += `<ul class = "m-0"><a href = "${url}" target = "_blank">${downloadName}</a></ul>`
    })
    message += '</li>'
    showMessage('Downloads Started','The following downloads have started. If you have a popup blocker, you may need to manually download the files by clicking on the links below:<hr>' + message + '</ul></li>');
  }
  // var urlList = `<li>`

  
}
function openLCMSSurvey(fromWhere){
  var link = document.createElement("a");
  link.href = 'https://arcg.is/1e0jef0';
  link.target = '_blank';
  link.click();
  ga('send', 'event','survey-open',fromWhere);
}
function downloadTutorial(){
  var link = document.createElement("a");
  var tutorial_name ='LCMS_v2021-7_Data_Explorer_Overview.pdf';
  link.href = './tutorials/'+tutorial_name;
    link.target = '_blank';
  link.click();
  ga('send', 'event',mode+'-download', 'tutorial-download', tutorial_name);
  // link.setAttribute("download", filename);
}
function downloadMethods(version){
  var link = document.createElement("a");
  var methods_name ='LCMS_'+version+'_Methods.pdf';
  // link.href = './tutorials/'+methods_name;
  
  link.href = 'https://data.fs.usda.gov/geodata/rastergateway/LCMS/'+methods_name;
  link.target = '_blank';
  link.click();
  ga('send', 'event',mode+'-download', 'methods-download', methods_name);
  // link.setAttribute("download", filename);
}
function downloadAnyMethods(path){
  var link = document.createElement("a");
  // var methods_name ='LCMS_'+version+'_Methods.pdf';
  // link.href = './tutorials/'+methods_name;
  
  link.href = path;//'https://data.fs.usda.gov/geodata/rastergateway/LCMS/'+methods_name;
  link.target = '_blank';
  link.click();
  ga('send', 'event',mode+'_methods-download', path);
}