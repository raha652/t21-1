document.getElementById('customerImage').addEventListener('change', function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const preview = document.getElementById('imagePreview');
    preview.src = e.target.result;
    preview.style.display = 'block';
    preview.style.width = '100px';
    preview.style.height = '100px';
    preview.style.objectFit = 'contain';
  };

  if (file) {
    reader.readAsDataURL(file);
  }
});

// مدیریت ارسال فرم و گرفتن تصویر از آن
document.getElementById('infoForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const statusBar = document.getElementById('statusBar');
  statusBar.textContent = 'در حال گرفتن تصویر از فرم و ارسال به تلگرام...';
  statusBar.style.color = 'blue';

  // مخفی‌کردن نوار وضعیت و دکمه برای اینکه در تصویر نیایند
  document.getElementById('submitBtn').style.display = 'none';
  statusBar.style.display = 'none';

  const originalContainer = document.querySelector('.container');

  // ساخت نسخه کپی‌شده از container
  const clone = originalContainer.cloneNode(true);

  // ساخت یک wrapper با حاشیه برای گرفتن عکس
  const wrapper = document.createElement('div');
  wrapper.id = 'screenshotWrapper';
  wrapper.style.padding = '40px';
  wrapper.style.backgroundColor = 'transparent';
  wrapper.style.display = 'inline-block';
  wrapper.appendChild(clone);

  document.body.appendChild(wrapper);
  originalContainer.style.display = 'none';

  html2canvas(wrapper, {
    scrollY: -window.scrollY,
    useCORS: true,
    scale: 5
  }).then(canvas => {
    canvas.toBlob(function (blob) {
      sendImageToTelegram(blob);

      // نمایش مجدد فرم اصلی و حذف wrapper
      document.body.removeChild(wrapper);
      originalContainer.style.display = 'block';
      document.getElementById('submitBtn').style.display = 'inline-block';
      statusBar.style.display = 'block';
    }, 'image/png');
  }).catch(error => {
    console.error("❌ خطا در گرفتن تصویر:", error);
    statusBar.textContent = '❌ خطا در گرفتن تصویر از فرم.';
    statusBar.style.color = 'red';
    document.body.removeChild(wrapper);
    originalContainer.style.display = 'block';
    document.getElementById('submitBtn').style.display = 'inline-block';
    statusBar.style.display = 'block';
  });
});

// ارسال تصویر به تلگرام
function sendImageToTelegram(imageBlob) {
  const formData = new FormData();
  formData.append('chat_id', '-4796066294');
  formData.append('document', imageBlob, 'form.png');

  fetch('https://api.telegram.org/bot7779785129:AAEMYhdJN1hCNXh5KXOQTxOxqH9d-TRtqtk/sendDocument', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      const statusBar = document.getElementById('statusBar');
      if (data.ok) {
        statusBar.textContent = '✅ تصویر فرم با موفقیت به تلگرام ارسال شد!';
        statusBar.style.color = 'green';
      } else {
        console.error("❌ خطا در ارسال تصویر:", data);
        statusBar.textContent = '❌ خطا در ارسال تصویر.';
        statusBar.style.color = 'red';
      }
    })
    .catch(error => {
      console.error("❌ خطا در ارتباط با تلگرام:", error);
      const statusBar = document.getElementById('statusBar');
      statusBar.textContent = '❌ خطا در ارتباط با سرور تلگرام.';
      statusBar.style.color = 'red';
    });
}
