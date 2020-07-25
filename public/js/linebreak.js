function escapeVal(textarea,replaceWith){
    // textarea is reference to that object, replaceWith is string that will replace the encoded return
    textarea.value = escape(textarea.value); //encode textarea string's carriage returns
    
    for(i=0; i<textarea.value.length; i++){
    // loop through string, replacing carriage return encoding with HTML break tag
    
    if(textarea.value.indexOf("%0D%0A") > -1){
    // Windows encodes returns as \r\n hex
    textarea.value = textarea.value.replace("%0D%0A",replaceWith)
    }
    else if(textarea.value.indexOf("%0A") > -1){
    // Unix encodes returns as \n hex
    textarea.value = textarea.value.replace("%0A",replaceWith)
    }
    else if(textarea.value.indexOf("%0D") > -1){
    // Macintosh encodes returns as \r hex
    textarea.value = textarea.value.replace("%0D",replaceWith)
    }
    
    }
    
    textarea.value=unescape(textarea.value) //unescape all other encoded characters
    }