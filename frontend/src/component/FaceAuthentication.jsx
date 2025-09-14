import { useRef, useContext, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "face-api.js";
import { API } from "../../utils/API";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/authContext";

const FaceAuthentication = () => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, getUser } = useContext(AuthContext);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadFaceApiModels = async () => {
      try {
          await tf.setBackend("webgl"); 
          await tf.ready();
          const MODEL_URL = "/models";  
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        console.log("✅ Face API Models Loaded Successfully! face auth");
        setModelsLoaded(true);
      } catch (error) {
        console.error("❌ Error loading face-api.js models:", error);
        toast.error("Failed to load face recognition models. Please retry.");
      }
    };

    loadFaceApiModels();
  }, []);

  const authenticateFace = async () => {
    if (!modelsLoaded) {
      toast.warn("Models are still loading. Please wait...");
      return;
    }

    const video = webcamRef.current?.video;
    if (!video) {
      toast.error("Webcam not found!");
      return;
    }

    try {
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.5,
      });

      const detection = await faceapi
        .detectSingleFace(video, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error("Face not detected! Ensure proper lighting & position.");
        return;
      }

      console.log("✅ Face Detection Successful!");

      const faceData = {
        faceDescriptor: Array.from(detection.descriptor),
      };

      const response = await API.post("/api/face-login", faceData);

      if (response.data.success) {
        toast.success("Face Recognized! Logging in...");

        const email = response.data.user.email;
        const responseProf = await API.post("/api/users/auth", { email });

        if (responseProf.data) {
          localStorage.setItem("token", responseProf.data?.token);
          localStorage.setItem("user", JSON.stringify(responseProf.data?.user));

          await getUser(); // refresh context
          navigate("/");
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
  }, [isAuthenticated, navigate]);

  return (
    <div className="bg-slate-900 min-h-screen">
      <h2 className="text-4xl text-center pt-3 font-semibold text-white mb-4">
        <span className="text-blue-500">Face</span> Login
      </h2>

      <div className="flex justify-center gap-10 items-center pt-[2.5rem]">
        <div className="bg-slate-900">
          <Webcam className="rounded-3xl w-[450px]" ref={webcamRef} />
          <div className="mt-6 flex justify-center">
            <button
              className={`px-4 py-2 rounded-xl text-white ${
                modelsLoaded
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "bg-gray-500 cursor-not-allowed"
              }`}
              onClick={authenticateFace}
              disabled={!modelsLoaded}
            >
              {modelsLoaded ? "Authenticate Face" : "Loading Models..."}
            </button>
          </div>
        </div>

        <div>
          <img
            className="rounded-3xl h-[400px]"
            src="https://i.pinimg.com/originals/87/fb/e7/87fbe73d7c995a3f96468c13cb9ea253.gif"
            alt="facial animation"
          />
        </div>
      </div>
    </div>
  );
};

export default FaceAuthentication;
