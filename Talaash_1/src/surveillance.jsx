import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

const SurveillanceApp = () => {
  // State management
  const [appMode, setAppMode] = useState('detection');
  const [webcamActive, setWebcamActive] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [detectedPerson, setDetectedPerson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(0);
  const recognitionIntervalRef = useRef(null);

  // Initialize webcam
  const initWebcam = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API not supported in this browser');
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error("Video play error:", err);
          throw new Error('Could not start video playback');
        });
      }

      setWebcamActive(true);
      setError(null);
      startFpsCounter();
      toast.success('Webcam activated successfully');
    } catch (err) {
      console.error("Webcam error:", err);
      setError(err.message || 'Could not access webcam');
      toast.error(`Webcam error: ${err.message}`);
      stopWebcam();
    }
  };

  // Clean up webcam
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    stopFpsCounter();
    stopRecognition();
    setWebcamActive(false);
    setDetectedPerson(null);
  };

  // FPS counter
  const startFpsCounter = () => {
    frameCountRef.current = 0;
    lastFpsUpdateRef.current = Date.now();
    
    const updateFps = () => {
      const now = Date.now();
      const delta = now - lastFpsUpdateRef.current;
      
      if (delta >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / delta));
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
      
      frameCountRef.current++;
      animationRef.current = requestAnimationFrame(updateFps);
    };
    
    animationRef.current = requestAnimationFrame(updateFps);
  };

  const stopFpsCounter = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setFps(0);
  };

  // Face recognition
  const startRecognition = () => {
    if (!webcamActive || recognitionActive) return;
    
    setRecognitionActive(true);
    setDetectedPerson(null);
    setLoading(false);
    
    // Process frames at 2 FPS (every 500ms)
    recognitionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      try {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        // Ensure video is ready
        if (video.readyState < 2) return;
        
        // Set canvas dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw frame to canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image as blob
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          
          setLoading(true);
          const formData = new FormData();
          formData.append('image', blob, 'frame.jpg');
          
          try {
            const response = await fetch('http://0.0.0.0:5000/api/recognize', {
              method: 'POST',
              body: formData
            });
            
           try {
    const response = await fetch('http://localhost:5000/api/recognize', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    if (!response.ok || result.error) {
        throw new Error(result.error || `HTTP error: ${response.status}`);
    }

    if (result.found) {
        setDetectedPerson(result.person);
        toast.success(`Found: ${result.person.name} (${result.person.confidence}%)`);
    } else {
        setDetectedPerson(null);
        toast.info('No match found.');
    }
} catch (err) {
    console.error("Recognition error:", err);
    toast.error(`Recognition failed: ${err.message}`);
} finally {
    setLoading(false);
}

          } catch (err) {
            console.error("Recognition error:", err);
            toast.error(`Recognition failed: ${err.message}`);
          } finally {
            setLoading(false);
          }
        }, 'image/jpeg', 0.85); // 85% quality
      } catch (err) {
        console.error("Frame processing error:", err);
        setLoading(false);
      }
    }, 500); // Process every 500ms (2 FPS)
  };

  const stopRecognition = () => {
    if (recognitionIntervalRef.current) {
      clearInterval(recognitionIntervalRef.current);
      recognitionIntervalRef.current = null;
    }
    setRecognitionActive(false);
    setLoading(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Handle mode changes
  useEffect(() => {
    if (appMode === 'detection' && recognitionActive) {
      stopRecognition();
    }
  }, [appMode, recognitionActive]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
          TALAASH - Missing Persons Recognition System
        </h1>
        
        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Operation Mode</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setAppMode('detection')}
                  className={`flex-1 py-2 px-3 rounded-md transition-all ${
                    appMode === 'detection' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                    Detection
                  </div>
                </button>
                <button
                  onClick={() => setAppMode('recognition')}
                  className={`flex-1 py-2 px-3 rounded-md transition-all ${
                    appMode === 'recognition' 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    Recognition
                  </div>
                </button>
              </div>
            </div>
            
            {/* Webcam Controls */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Webcam Controls</h2>
              <div className="flex space-x-2">
                <button
                  onClick={webcamActive ? stopWebcam : initWebcam}
                  className={`flex-1 py-2 px-3 rounded-md transition-all flex items-center justify-center ${
                    webcamActive 
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' 
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                  }`}
                >
                  {webcamActive ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Stop Webcam
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                      </svg>
                      Start Webcam
                    </>
                  )}
                </button>
                
                {webcamActive && appMode === 'recognition' && (
                  <button
                    onClick={recognitionActive ? stopRecognition : startRecognition}
                    disabled={loading}
                    className={`flex-1 py-2 px-3 rounded-md transition-all flex items-center justify-center ${
                      recognitionActive 
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' 
                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                    } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {recognitionActive ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Stop
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Recognize
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className={`h-3 w-3 rounded-full ${
                webcamActive ? 'bg-green-500' : 'bg-gray-400'
              }`}></span>
              <span className="text-sm text-gray-600">
                Webcam: {webcamActive ? 'Active' : 'Inactive'} {fps > 0 && `(${fps} FPS)`}
              </span>
            </div>
            
            {appMode === 'recognition' && (
              <div className="flex items-center space-x-2">
                <span className={`h-3 w-3 rounded-full ${
                  recognitionActive ? 'bg-purple-500' : 'bg-gray-400'
                }`}></span>
                <span className="text-sm text-gray-600">
                  Recognition: {recognitionActive ? 'Active' : 'Inactive'} {loading && '(Processing...)'}
                </span>
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
        
        {/* Video Feed */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {webcamActive ? (
            <div className="relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-auto bg-black"
                onCanPlay={() => console.log('Video can play')}
                onError={(e) => {
                  console.error("Video error:", e);
                  setError('Video playback error');
                }}
              />
              
              {/* Overlay indicators */}
              <div className="absolute top-2 left-2 flex space-x-2">
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                  appMode === 'detection' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                }`}>
                  {appMode === 'detection' ? 'Detection Mode' : 'Recognition Mode'}
                </span>
                
                {recognitionActive && (
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-yellow-600 text-white">
                    Processing: {loading ? 'Active' : 'Ready'}
                  </span>
                )}
              </div>
              
              {/* Detection results */}
              {detectedPerson && (
                <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 p-4 rounded-md shadow-lg border border-gray-200">
                  <h3 className="font-bold text-lg text-green-600 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Person Identified
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-gray-700">Name:</p>
                      <p className="text-gray-900">{detectedPerson.name}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Confidence:</p>
                      <p className="text-gray-900">{detectedPerson.confidence}%</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Phone:</p>
                      <p className="text-gray-900">{detectedPerson.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Last Seen:</p>
                      <p className="text-gray-900">{detectedPerson.last_seen || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 md:p-16 flex flex-col items-center justify-center bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-lg mb-1">Webcam is currently inactive</p>
              <p className="text-gray-400 text-sm">Click "Start Webcam" to begin surveillance</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default SurveillanceApp;