/* Method for hiding/unhiding checkbox selects inspired by https://stackoverflow.com/questions/19206919/how-to-create-checkbox-inside-dropdown */

window.addEventListener('DOMContentLoaded', function () {
  var checkList = document.getElementById('games-multi-select');
  if (checkList) {
    checkList.getElementsByClassName('checkbox-main')[0].onclick = function(evt) {
      if (checkList.classList.contains('visible'))
        checkList.classList.remove('visible');
      else
        checkList.classList.add('visible');
    }
  }
});

window.addEventListener('DOMContentLoaded', function () {
  var checkList = document.getElementById('employees-multi-select');
  if (checkList) {
    checkList.getElementsByClassName('checkbox-main')[0].onclick = function(evt) {
      if (checkList.classList.contains('visible'))
        checkList.classList.remove('visible');
      else
        checkList.classList.add('visible');
    }
  }
});