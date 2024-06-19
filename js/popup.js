var m3u8list = [];
const bgPort = chrome.runtime.connect();

$(function(){
    render(m3u8list)
    //Listen for content-script messages
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if(request.from == 'content_script' && request.reload == 'done'){
            //Re-obtain the link after the refresh is successful
            bgPort.postMessage({action:'getList'});
        }
        return true;
    });
    bgPort.onMessage.addListener(function(receivedPortMsg) {//Listening background
        //console.log("popup: I received the message!"); //This is the content sent by the background
		//console.log(receivedPortMsg); //This is the content sent by background
        if(receivedPortMsg.action = 'm3u8List'){
            if(receivedPortMsg.data){
                m3u8list = receivedPortMsg.data
                render(m3u8list)
            }
        }
	});
    bgPort.postMessage({action:'getList'});//Send message to background
})

$(document).ready(function() {
    //The click event must be written like this, otherwise a CSP error will be reported
    document.getElementById("reload").addEventListener("click",reload);
  });

//refresh page
function reload(){
    //console.log('function : reload');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "reload"});
      });
}

//rendering
function render(list){
    if(list !== undefined){
        if(list.length==0){
            $(".alert-danger").addClass("show")
            $(".alert-danger").removeAttr("hidden")
        }else{
            $("#box").html()
            for (i = 0; i < list.length; i++) {
                let urlStr = list[i].url.substring(0,24) + (list[i].url.length > 24 ? "..." : "");
                let tokenStr = list[i].token.substring(0,24) + (list[i].token.length > 24 ? "..." : "");

                $("#box").append(
                    '<div class="col-5 mt-1 mb-1"><span>' + urlStr +
                    // (list[i].url.indexOf("?")!=-1?list[i].url.slice(0,list[i].url.indexOf("?")).slice(list[i].url.lastIndexOf("/")+1,list[i].url.length):list[i].url.slice(list[i].url.lastIndexOf("/")+1,list[i].url.length)) +
                    '</span></div>' + 
                    '<div class="col-5 mt-1 mb-1"><span>'+tokenStr+'</span></div>' +
                    '<div class="col-2 mt-1 mb-1"><a id="url' + i + '" href="#" style="float: right;"><img src="img/copy-icon.svg" style="width:24px;" alt="Copy"/>&nbsp;</a></div>');
                $("#url" + i).click({ "url": list[i].url, "token": list[i].token }, copyUrl);
                //console.log("Get m3u8 link")
            }
            $(".alert-danger").removeClass("show")
            $(".alert-danger").attr("hidden","hidden")
        }
    }
}

//Copy link to clipboard
function copyUrl(obj) {
    if (obj.data.token == undefined || obj.data.token == "") {
        navigator.clipboard.writeText(obj.data.url);
    } else {
        navigator.clipboard.writeText(obj.data.url + "\t" + obj.data.token);
    }
    $(".alert-success").addClass("show")
    $(".alert-success").removeAttr("hidden")
    window.setTimeout(function(){
        $(".alert-success").removeClass("show")
        $(".alert-success").attr("hidden","hidden")
    },2000);//Disappears after 2 seconds
}



