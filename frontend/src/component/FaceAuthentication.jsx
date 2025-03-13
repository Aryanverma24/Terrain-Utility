import { useRef ,useContext,useEffect, useState} from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import axios from "axios";  
import { API } from "../../utils/API";  
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/authContext";

const FaceAuthentication = () => {
    const webcamRef = useRef(null);
    const navigate = useNavigate();
    const { isAuthenticated, getUser } = useContext(AuthContext);
    const [loadModels, setModelsLoaded] = useState(false);

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
                setModelsLoaded(true);
            } catch (error) {
                console.error("❌ Error loading models", error);
            }
        };
        loadModels();
    }, []);

    const authenticateFace = async () => {
        const video = webcamRef.current?.video;
        if (!video) {
            toast.error("Webcam not found!");
            return;
        }
        
        const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
        const detection = await faceapi.detectSingleFace(video, options)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            toast.error("Face not detected! Ensure proper lighting & position.");
            return;
        }

        console.log("✅ Face Detection Successful!", detection);

        const faceData = {
            faceDescriptor: Array.from(detection.descriptor)
        };

        console.log("Authenticating Face...", faceData);

        try {
            const response = await API.post("/api/face-login", faceData);
            // console.log(response.data)

            if (response.data.success) {
                toast.success("Face Recognized! Logging in...");
                const email = await response.data.user.email
                const responseProf = await API.post("/api/users/auth", { email , });
                console.log(responseProf.data)
                if (responseProf) {
                    // Assuming data has user information
                    localStorage.setItem("token", responseProf.data?.token);
                    localStorage.setItem("user", JSON.stringify(responseProf.data?.user));  // Ensure correct data is being saved
                    console.log(isAuthenticated)
                    getUser();  // Call getUser to update the context
                    navigate("/");  // Navigate after successful login
                }
            } else {
                toast.error("Face Not Recognized!");
            }
        } catch (error) {
            console.error("❌ Error authenticating face:", error);
            toast.error("Error authenticating face. Try again.");
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
          navigate("/");
        }
      }, [isAuthenticated]);

    return (
      <>
        <div className="bg-slate-900 min-h-screen">
            <h2 className='text-4xl  text-center pt-3 font-semibold text-white mb-4'><span className="text-blue-500">Face</span> Login</h2>
            <div className="flex justify-center gap-10 items-center pt-[2.5rem]">
                <div className="bg-slate-900">
                        <Webcam className='rounded-3xl w-[450px] ' ref={webcamRef} />
                        <div className='mt-6 flex justify-center'> 
                          <button className='bg-blue-700 text-white px-4 py-2 rounded-xl hover:bg-blue-800' onClick={authenticateFace}>
                           Authenticate Face
                          </button>
                        </div> 
                </div>
                <div className="">
                    <img
                        className="rounded-3xl h-[400px]" 
                        src="https://i.pinimg.com/originals/87/fb/e7/87fbe73d7c995a3f96468c13cb9ea253.gif" 
                        alt="facial image" />
                </div>
            </div>
        </div>
      </>
    );
};

export default FaceAuthentication;
