document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleButton');
    const mainTitle = document.getElementById('mainTitle');
    const mainSubtitle = document.getElementById('mainSubtitle');
    let isEnglish = true;

    toggleButton.addEventListener('click', function() {
        if (isEnglish) {
            toggleButton.textContent = 'AR';
            toggleButton.style.backgroundColor = '#6c757d';
            mainTitle.textContent = 'معرض الحبر الذهبي';
            mainSubtitle.textContent = 'عملية تعلم الطباعة الحجرية التفاعلية خطوة بخطوة';
        } else {
            toggleButton.textContent = 'EN';
            toggleButton.style.backgroundColor = '#007BFF';
            mainTitle.textContent = 'Golden Ink Exhibition';
            mainSubtitle.textContent = 'Interactive step-by-step lithography learning process';
        }
        isEnglish = !isEnglish;
    });
});