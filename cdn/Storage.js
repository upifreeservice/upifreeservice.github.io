<style>
    #overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: white;
      z-index: 999;
      display: none;
    }
  </style>

document.getElementById("startButton").addEventListener("click", function() {
  var urls = ["https://example.com/page1", "https://example.com/page2", "https://example.com/page3"];
  var randomUrl = urls[Math.floor(Math.random() * urls.length)];

  localStorage.setItem("randomRedirect", randomUrl);

  // Show the overlay before redirection
  document.getElementById("overlay").style.display = "block";

  // Redirect immediately
  window.location.replace(randomUrl);
});

var savedRedirect = localStorage.getItem("randomRedirect");
if (savedRedirect) {
  // Show the overlay before automatic redirection
  document.getElementById("overlay").style.display = "block";

  // Redirect immediately
  window.location.replace(savedRedirect);
}

