const urlRadioButton = document.getElementById('url');
const fileRadioButton = document.getElementById('file');
const urlInput = document.getElementById('url-input');
const fileInput = document.getElementById('file-input');
const generateButton = document.getElementById('generate-btn');
const resultDiv = document.querySelector('.result');

urlRadioButton.addEventListener('change', () => {
   if (urlRadioButton.checked) {
      urlInput.classList.remove("hidden");
      fileInput.classList.add("hidden");
   }
});

fileRadioButton.addEventListener('change', () => {
   if (fileRadioButton.checked) {
      urlInput.classList.add("hidden");
      fileInput.classList.remove("hidden");
   }
});

generateButton.addEventListener('click',async () => {
   if (urlRadioButton.checked) {
      const url = urlInput.value.trim();
      if (url) {
         const filename = url.split('/').pop().split('.').slice(0, -1).join('.');
         await generateWebP(filename, url);
      } else {
         alert('Please enter a valid URL.');
      }
   } else if (fileRadioButton.checked) {
      const file = fileInput.files[0];
      if (file) {
         if (file.type.startsWith('image/')) {
            const filename = file.name.split('.').slice(0, -1).join('.');
            await generateWebP(filename, file);
         } else {
            alert('Please select a valid image file.');
         }
      } else {
         alert('Please select a file.');
      }
   } else {
      alert('Please select an image source.');
   }
});

function fileToImage(file) {
   return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
         const img = new Image();
         img.onload = () => resolve(img);
         img.onerror = () => reject(new Error('Failed to load image from file.'));
         img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
   });
}

function urlToImage(url) {
   return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => {
         console.error('Error loading image:', e);
         reject(new Error('Failed to load image from URL.'));
      }
      img.src = url;
   });
}

/**
 * {another approach to convert URL into Image}
 * Download image from url then save it into memory as Blob,
 * and then convert it to Image object.
 */
// function urlToImage(url) {
//    return new Promise((resolve, reject) => {
//       fetch(url)
//          .then(response => {
//             if (!response.ok) {
//                throw new Error('Network response was not ok');
//             }
//             return response.blob();
//          })
//          .then(blob => {
//             const img = new Image();
//             img.onload = () => resolve(img);
//             img.onerror = () => reject(new Error('Failed to load image from URL.'));
//             img.src = URL.createObjectURL(blob);
//          })
//          .catch(error => reject(new Error(`Failed to fetch image: ${error.message}`)));
//    });
// }

async function rawInputToImage(input) {
   let image;
   if (typeof input === 'string') {
      try {
         image = await urlToImage(input);
      } catch (error) {
         alert(error.message);
         return;
      }
   } else if (input instanceof File) {
      try {
         image = await fileToImage(input);
      } catch (error) {
         alert(error.message);
         return;
      }
   } else {
      alert('Invalid input type.');
      return;
   }
   return image;
}

async function generateWebP(filename, input) {
   const image = await rawInputToImage(input);
   const preferedWidth = 512;
   const preferedHeight = 512;
   const width = (image.width > preferedWidth) ? preferedWidth : image.width;
   const height = (image.height > preferedHeight) ? preferedHeight : image.height;
   const quality = 0.8;
   const filenameWithExtension = `${filename}.webp`;

   const canvas = document.createElement('canvas');
   const ctx = canvas.getContext('2d');
   canvas.width = width
   canvas.height = height
   ctx.clearRect(0, 0, width, height);
   ctx.drawImage(image, 0, 0, width, height);
  
   const webpDataUrl = canvas.toDataURL('image/webp', quality);
   const blob = await fetch(webpDataUrl).then(res => res.blob());
   const url = URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.download = filenameWithExtension;
   link.textContent = `Download ${filenameWithExtension}`;
   resultDiv.appendChild(link);
}
