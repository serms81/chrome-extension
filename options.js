
function echo(name_of_label, placeholders){
  if (!placeholders)
    return chrome.i18n.getMessage(name_of_label);
  else
    return chrome.i18n.getMessage(name_of_label,placeholders);
}

var save_options_button = document.getElementById('save-options');
var status_display      = document.getElementById('saving-status');
var color_select        = document.getElementById('color');
var color_selected      = document.getElementById('selected-color');
var like_checkbox       = document.getElementById('like');


// Saves options to chrome.storage.sync.
function saveOptions() {

  save_options_button.disabled = true;

  var color      = color_select.value;
  var likesColor = like_checkbox.checked;

  chrome.storage.sync.set(
    {
      'favoriteColor': color,
      'likesColor': likesColor
    },
    function() {

      // Update status to let user know options were saved.
      status_display.textContent = echo('options_OptionsSaved', '2');
      color_selected.textContent = color;
      color_selected.style.color = color;
      setTimeout( function() {

        status_display.textContent = '';
        save_options_button.disabled = false;

      }, 750 );

    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {

  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get(
    {
      'favoriteColor': 'red',
      'likesColor': true
    },
    function(items) {

      color_select.value          = items.favoriteColor;
      color_selected.textContent  = items.favoriteColor;
      color_selected.style.color  = items.favoriteColor;
      like_checkbox.checked       = items.likesColor;

    }
  );
}

document.addEventListener('DOMContentLoaded', function () {

  document.getElementById('favcolor-panel-header-title').textContent   = echo('options_FavColorTitle');
  document.getElementById('likecolors-panel-header-title').textContent = echo('options_LikeColorTitle');


  restoreOptions();
  save_options_button.addEventListener('click', saveOptions);

});
