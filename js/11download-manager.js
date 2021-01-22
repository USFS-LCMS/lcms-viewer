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
    link.target = '_blank';
    var downloadName = url.substr(url.lastIndexOf('/') + 1);
    

    // link.download ='hello';// downloadName;
    // link.setAttribute('download',downloadName);

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

    showMessage('SUCCESS','Your download of ' + downloadName + ' should complete shortly!');
  }
}
function downloadTutorial(){
  var link = document.createElement("a");
  link.href = './tutorials/LCMS_Data_Explorer_Overview_20200317.pdf';
    link.target = '_blank';
  link.click();
  // link.setAttribute("download", filename);
}