import axios from 'axios';
import React, { useState } from 'react';
import { appVars } from '../conf/conf';

const ImageSelector = () => {
  const [cameraImage, setCameraImage] = useState(null);
  const [deviceImage, setDeviceImage] = useState(null);

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const imageDataUrl = reader.result;
      setDeviceImage(imageDataUrl);
      // Save image to local storage
      localStorage.setItem('deviceImage', imageDataUrl);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureImage = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();

          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageDataUrl = canvas.toDataURL('image/png');
            setCameraImage(imageDataUrl);
            // Save image to local storage
            localStorage.setItem('cameraImage', imageDataUrl);

            video.pause();
            video.srcObject = null;
            stream.getTracks().forEach(track => track.stop());
          };
        })
        .catch((error) => {
          console.error('Error accessing camera:', error);
        });
    } else {
      console.error('getUserMedia not supported on your browser');
    }
  };
  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }
  // Function to handle saving the image, for example sending it to a server
  const saveImage = async () => {
    try {
      const savedCameraImage = localStorage.getItem('cameraImage');
      const savedDeviceImage = localStorage.getItem('deviceImage');
    
      // Convert base64 strings back to Blob objects
      const cameraBlob = dataURItoBlob(savedCameraImage);
      const deviceBlob = dataURItoBlob(savedDeviceImage);
    
      const formData = new FormData();
      formData.append('camera_image', cameraBlob, 'camera_image.png');
      formData.append('device_image', deviceBlob, 'device_image.png');
    
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    
      localStorage.removeItem('cameraImage');
      localStorage.removeItem('deviceImage');
      setCameraImage(null);
      setDeviceImage(null);
      alert(response.data.result);
    } catch (error) {
      alert('Error saving image');
      console.error('Error saving image:', error);
    }

  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-1/2">
        {deviceImage && (
          <img src={deviceImage} alt="Selected from device" className="mx-auto" />
        )}
        <input type="file" accept="image/*" onChange={handleFileInputChange} className="block mx-auto my-4" />
      </div>
      <div className="w-1/2 flex justify-center items-center">
        {cameraImage && (
          <img src={cameraImage} alt="Selected from camera" className="mx-auto" />
        )}
        <button onClick={handleCaptureImage} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Capture Image
        </button>
      </div>
      <div className="text-center mt-4">
        {/* Button to save the image */}
        <button onClick={saveImage} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Save Image
        </button>
      </div>
    </div>
  );
};

export default ImageSelector;
