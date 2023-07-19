var black = document.getElementsByClassName('black')[0];
var gradient = document.getElementsByClassName('gradient')[0]
var tick = document.getElementsByClassName('tick')[0];
var m = document.getElementById('m');
m.addEventListener('input', function () {
    black.style.transform = gradient.style.transform = tick.style.transform = "translate(-50%,-50%)rotateZ(-" + (180 / 100) * m.value + "deg)"
});
