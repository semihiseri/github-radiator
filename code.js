
var address = 'https://api.github.com/repos/Coolnesss/lapio-galleria/contents/profiles'

$.get(address, function(data) {
  data.forEach(function(entry) {
    $.getJSON(entry.download_url, function(data) {
      $("#cards")[0].className = "mdl-grid"
      $("#cards").append(`
        <div class="mdl-cell mdl-cell--4-col" id=${entry.sha}>
          <div class="demo-card-square mdl-card mdl-shadow--2dp">
            <div style='background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.6), transparent), url("${data.picture}");' class="mdl-card__title mdl-card--expand">
              <h2 class="mdl-card__title-text">${data.name} (${data.ircnick})</h2>
            </div>
            <div class="mdl-card__supporting-text">
              ${data.description}
            </div>
            <div class="mdl-card__actions mdl-card--border">
              <a href=${data.homepage} class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
                Visit Homepage
              </a>
            </div>
          </div>
        </div>`
      );
    })
  })
})
