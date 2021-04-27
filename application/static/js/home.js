
// This is for the homepage
$('#submitMood').click(()=>{

    var name = $('#name').val();
    var emojiSelected = $("input[name='emoji-choice']:checked").val();
    console.log(emojiSelected);
    if(name === '' || emojiSelected===undefined){
        if(name === ''){
            $('#missingName').css('display','flex');
        } 
        if(emojiSelected===undefined){
            $('#missingEmoji').css('display','flex');
        } 
      
      return;
    }
    window.location = '/class?name='+name+'&emoji='+emojiSelected;
    console.log(window.location);
    
})