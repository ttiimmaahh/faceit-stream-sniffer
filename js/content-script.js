//Listen for pop-up messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    //Failure to respond will result in an error
    sendResponse('y')
	if(request.action  == 'reload'){
        location.reload()
    }
});

//refresh page
function reload(){
    location.reload()
}

//Send message to popup
function send(){
    chrome.runtime.sendMessage({from:'content_script',reload: 'done'});
}

//Send a message to the popup after the web page is loaded
window.onload = send()