import Toast from './js/Toast.js'

async function DoToast() {
    await Toast('something')
}



document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("Something");
    btn.addEventListener("click", function(){
        DoToast();
    });
});
