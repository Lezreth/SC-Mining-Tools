///
///  Determines if the user has a set theme.
///
const detectColorScheme = () => {
    var theme = "dark";    //  Default to dark.

    //  Local storage is used to override OS theme settings.
    if (localStorage.getItem("theme")) {
        if (localStorage.getItem("theme") == "light") {
            var theme = "light";
        }
    } else if (!window.matchMedia) {
        //  matchMedia method not supported.
        return false;
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        //  OS theme setting detected as light.
        var theme = "light";
    }

    //  Light theme preferred, set document with a `data-theme` attribute.
    if (theme == "light") {
        document.documentElement.setAttribute("data-theme", "light");
    }
}
detectColorScheme();