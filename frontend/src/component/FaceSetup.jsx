import { useEffect, useRef, useContext, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "face-api.js";
import { API } from "../../utils/API";
import { AuthContext } from "../../contexts/authContext";
import { toast } from "react-toastify";

const FaceSetup = () => {
  const { user } = useContext(AuthContext);
  const webcamRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
  const loadModels = async () => {
    try {
      await tf.setBackend("webgl");  
      if (!(await tf.setBackend("webgl"))) {
          await tf.setBackend("cpu");
      }

      await tf.ready();

      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      setModelsLoaded(true);
      console.log("✅ Face-api models loaded with backend:", tf.getBackend());
    } catch (error) {
      console.error("❌ Error loading face-api models:", error);
    }
  };

  loadModels();
}, []);


  // Capture and save user face
  const captureFace = async () => {
    if (!user?.email) {
      toast.error("User email missing. Please log in again.");
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
        toast.warning("No face detected. Ensure good lighting and camera angle.");
        return;
      }

      console.log("✅ Face captured", detection);

      const faceData = {
        email: user.email,
        faceDescriptor: Array.from(detection.descriptor), // Convert Float32Array to normal array
      };

      const response = await API.post("/api/add-face", faceData);
      console.log("✅ Face data saved:", response.data);

      toast.success("Face data saved successfully!");
    } catch (error) {
      console.error("❌ Error capturing face:", error);
      toast.error("Failed to save face data. Try again.");
    }
  };

  return (
    <div className="flex justify-center bg-gray-950 pt-8 h-screen">
      <div className="text-green-700">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Set Up Your Face Login
        </h2>

        {!modelsLoaded ? (
          <p className="text-center text-gray-400">Loading models...</p>
        ) : (
          <>
            <Webcam
              className="rounded-xl w-96 h-96 mb-4"
              ref={webcamRef}
              videoConstraints={{ facingMode: "user" }}
            />

            <div className="flex justify-center">
              <button
                className="bg-green-700 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-800"
                onClick={captureFace}
              >
                Save Face Data
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FaceSetup;
