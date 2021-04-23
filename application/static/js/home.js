
// This is for the homepage
$('#submitMood').click(()=>{

    var name = $('#name').val();
    var emojiSelected = $("input[name='emoji-choice']:checked").val();
    if(name === ''){
      $('#missingName').css('display','flex');
    }else{
      window.location = '/instructor?name='+name+'&emoji='+emojiSelected;
      console.log(window.location);
    }
  })