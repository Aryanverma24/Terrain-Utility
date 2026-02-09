// import { useEffect, useRef ,useContext} from "react";
// import Webcam from "react-webcam";
// import * as faceapi from "face-api.js";
// import axios from "axios";  
// import { API } from "../../utils/API";  
// import { AuthContext } from "../../contexts/authContext";
// import { toast } from "react-toastify";


// const FaceSetup = () => {
//   const { user } = useContext(AuthContext);
//     const webcamRef = useRef(null);

//     useEffect(() => {
//         const loadModels = async () => {
//             try {
//               const MODEL_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";
//               await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
//               await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
//               await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
              

//                 console.log("✅ Face API Models Loaded Successfully!");
//             } catch (error) {
//                 console.error("❌ Error loading models", error);
//             }
//         };
//         loadModels();
//     }, []);


//     const captureFace = async () => {
//       if (!user || !user.email) {
//           console.error("❌ User email not found!");
//           alert("User email is missing. Please log in again.");
//           return;
//       }
  
//       const video = webcamRef.current?.video;
//       if (!video) {
//           alert("Webcam not found!");
//           return;
//       }
  
//       const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
//       const detection = await faceapi.detectSingleFace(video, options)
//           .withFaceLandmarks()
//           .withFaceDescriptor();
  
//       if (!detection) {
//           alert("Face not detected! Ensure proper lighting & position.");
//           return;
//       }
  
//       console.log("✅ Face Detection Successful!", detection);
  
//       // Save face data
//       const faceData = {
//         email: user.email, 
//         faceDescriptor: Array.from(detection.descriptor) // ✅ Same as backend
//     };
  
//       console.log("Saving Face Data:", faceData);

//       try {
//          const response  = await API.post("/api/add-face",faceData);

//         console.log("✅ Face Data Saved Successfully!", response.data);
//         toast.success("Face data saved successfully!");

//     } catch (error) {
//         console.error("❌ Error saving face data:", error);
//         alert("Error saving face data. Try again.");
//     }
//   };
  

//     return (
//         <div className='flex justify-center bg-gray-950 pt-[2rem] h-screen'>
//             <div className='text-green-700'>
//                 <h2 className='text-xl font-semibold mb-2 text-center'>Set Up Your Face Login</h2>
//                 <Webcam className='rounded-xl w-96 h-96 mb-2' ref={webcamRef} />
//                 <div className='flex justify-center'> 
//                     <button className='bg-green-700 text-white px-2 py-1 rounded-xl text-semi-bold hover:bg-green-800' onClick={captureFace}>
//                         Save Face Data
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default FaceSetup;
