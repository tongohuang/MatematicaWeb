// ...existing code...
function showOptions(type) {
    const options = document.querySelector(`.${type}-options`);
    if (options) {
        options.style.display = 'block';
        options.style.zIndex = '9999'; // Asegura que esté al frente
    }
}
// ...existing code...
