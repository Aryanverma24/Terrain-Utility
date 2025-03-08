import { useRef ,useEffect} from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import axios from "axios";  
import { API } from "../../utils/API";  
import { useNavigate } from "react-router-dom";

const FaceAuthentication = () => {
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";

                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);

                console.log("✅ Face API Models Loaded Successfully!");
                setModelsLoaded(true);  // Mark models as loaded
            } catch (error) {
                console.error("❌ Error loading models", error);
            }
        };
        loadModels();
    }, []);

    const authenticateFace = async () => {
        const video = webcamRef.current?.video;
        if (!video) {
            alert("Webcam not found!");
            return;
        }
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
        const detection = await faceapi.detectSingleFace(video, options)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            alert("Face not detected! Ensure proper lighting & position.");
            return;
        }

        console.log("✅ Face Detection Successful!", detection);

        // Send face data for authentication
        const faceData = {
            faceDescriptor: Array.from(detection.descriptor)  
        };

        console.log("Authenticating Face...", faceData);

        try {
            const response = await API.post("/api/face-login", faceData);

            if (response.data.success) {
                console.log("✅ Face Authenticated Successfully!");
                toast.success(`Welcome, ${response.data.user.username}!`);
                navigate("/profile");  // **Successful login -> Dashboard**
            } else {
                console.log("❌ Face Not Recognized!");
                alert("Face Not Recognized. Try Again.");
            }

        } catch (error) {
            console.error("❌ Error authenticating face:", error);
            alert("Error authenticating face. Try again.");
        }
    };

  return (
    
    <>
        <div className="bg-slate-900 h-screen">
            {/* <img className='bg-blend-darken h-screen absolute z-0' src='https://img.pikbest.com/backgrounds/20190903/internet-face-recognition-background-picture_1902692.jpg!bw700' /> */}

          <div className="flex">

          <div className="">
            <h2 className='text-3xl pt-4 font-semibold text-center text-white'>Face Login</h2>
                <Webcam className='rounded-3xl scale-[0.75] py-0' ref={webcamRef} />
                <div className='flex justify-center'> 
                    <button className='bg-blue-700 text-white px-2 py-1 rounded-xl text-semi-bold mt-[-2rem] hover:bg-blue-800' onClick={authenticateFace}>
                        Authenticate Face
                    </button>
                </div> 
            </div>
                <div className="pt-[4rem] mr-[1rem] flex justify-center items-center">
                     <img className="w-[400px] h-[400px]"  src="https://i.pinimg.com/originals/87/fb/e7/87fbe73d7c995a3f96468c13cb9ea253.gif" alt="" />
                </div>
          </div>
        </div>
    </>
  )
}

export default FaceAuthentication