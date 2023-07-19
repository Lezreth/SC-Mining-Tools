///
///  Identify the toggle switch HTML element.
///
const toggleSwitch = document.querySelector('#theme-switch input[type="checkbox"]');

//  Function that changes the theme, and sets a localStorage variable to track the theme between page loads.
function switchTheme(e) {
    if (e.target.checked) {
        localStorage.setItem('theme', 'light');
        document.documentElement.setAttribute('data-theme', 'light');
        toggleSwitch.checked = true;
    } else {
        localStorage.setItem('theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleSwitch.checked = false;
    }
}

//  Listener for changing themes.
toggleSwitch.addEventListener('change', switchTheme, false);

//  Pre-check the light-theme checkbox if light-theme is set.
if (document.documentElement.getAttribute("data-theme") == "light") {
    toggleSwitch.checked = true;
}
