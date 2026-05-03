import { useState, useEffect } from 'react';
import { useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import MapPicker from '../GeoComponents/mapPicker';
import { stateCoordinates } from '../../../../backend/utils/stateCoordinates';
import { locationData } from '../../data/indiancities';
import StateCitySelector from '../GeoComponents/stateCitySelector';
import {
  FaSpinner,
  FaUpload,
  FaFileAlt,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaRulerCombined,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaHome,
  FaImage,
  FaFolderOpen,
  FaBuilding,
  FaTree,
  FaCity,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaAward,
  FaChartLine,
} from 'react-icons/fa';

function CreateLand() {
  const [currentStep, setCurrentStep] = useState(0); // instead of 1
  const [landtype, setLandtype] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [image, setImage] = useState(null);
  const [owner, setOwner] = useState(null);
  const [price, setPrice] = useState('');
  const [length, setLength] = useState('');
  const [breadth, setBreadth] = useState('');
  const [description, setDescription] = useState('');
  
  const [documents, setDocuments] = useState({
    Aadhaar: null,
    Pan: null,
    LandRegistry: null,
    EncumbranceCertificate: null,
    Khata: null,
    PropertyTax: null,
    SurveyMap: null,
    Noc: null,
    OwnerPhoto: null,
    Bills: [],
    LandPhotos: [],
  });
  //token money states
  const [tokenAmount, setTokenAmount] = useState('');
const [customTokenEdited, setCustomTokenEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100%
  const [docErrors, setDocErrors] = useState({});
  //geo based states
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [coordinates, setCoordinates] = useState(null);
  //declaration state
  const [agreed, setAgreed] = useState(false);
  const [declarationError, setDeclarationError] = useState(false);

  // OCR + Extraction

const [saleDeedFiles, setSaleDeedFiles] = useState([]);
const [ocrLoading, setOcrLoading] = useState(false);
const [extractionData, setExtractionData] = useState(null);
const [showExtractionModal, setShowExtractionModal] = useState(false);

  //for setting ai generated description
  const [aiDescriptions, setAiDescriptions] = useState([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  //-------this is for genrating auto description--------
  //function for generating prompt for auto description
  const generatePrompt = () => {
    return `You are a professional real estate copywriter.

Write 3 different property descriptions for the following land:

Type: ${landtype}
Location: ${city}, ${state}
Price: ₹${price}
Dimensions: ${length} x ${breadth} ft

Instructions:
- Description 1 should be premium and luxurious in tone
- Description 2 should be investment-focused
- Description 3 should be simple and informative

IMPORTANT RULES:
- DO NOT mention or label the tone or type
- DO NOT write "premium", "investment", or "simple"
- Each description should be 80–120 words
- Each must feel clearly different in style
- Output everything in ONE block
- Use ONLY the following format:

[DESC_1]
<description>

[DESC_2]
<description>

[DESC_3]
<description>

Do not add any extra text before or after.`;
  };

  //for autofill chatgpt open attempt
  const openChatGPT = () => {
    const prompt = generatePrompt();

    const url = `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;

    window.open(url, '_blank');
  };
  //copying prompt by button
  const copyPrompt = async () => {
    try {
      const prompt = generatePrompt();
      await navigator.clipboard.writeText(prompt);
      toast.success('Prompt copied! Paste in ChatGPT.');
    } catch {
      toast.error('Failed to copy prompt');
    }
  };
  //validating clipboard repsonse
  const isValidAIResponse = (text) => {
    if (!text || typeof text !== 'string') return false;

    const trimmed = text.trim();

    return (
      trimmed.includes('[DESC_1]') &&
      trimmed.includes('[DESC_2]') &&
      trimmed.includes('[DESC_3]')
    );
  };
  //getting copied clipboard text
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();

      // 1. empty clipboard
      if (!text || text.trim().length === 0) {
        toast.error('Clipboard is empty. Copy AI response first.');
        return;
      }

      //  2. invalid format
      if (!isValidAIResponse(text)) {
        toast.error('Invalid format. Please copy AI-generated response only.');
        return;
      }

      //  3. valid flow
      const parsed = parseDescriptions(text);

      setAiDescriptions(parsed);
      setShowAIModal(true);

      toast.success('AI response loaded successfully!');
    } catch (err) {
      toast.error('Clipboard access failed. Please paste manually.');
    }
  };

  //handling the ai response
  const handleAIResponse = (text) => {
    if (
      !text.includes('[DESC_1]') ||
      !text.includes('[DESC_2]') ||
      !text.includes('[DESC_3]')
    ) {
      toast.error('Invalid AI format. Please regenerate.');
      return;
    }

    const parsed = parseDescriptions(text);
    setAiDescriptions(parsed); // store array of 3 descriptions
    setShowAIModal(true); // open selection modal
  };
  //for spliting the description
  const parseDescriptions = (text) => {
    const d1 = text.split('[DESC_1]')[1]?.split('[DESC_2]')[0]?.trim();
    const d2 = text.split('[DESC_2]')[1]?.split('[DESC_3]')[0]?.trim();
    const d3 = text.split('[DESC_3]')[1]?.trim();

    return [d1, d2, d3].filter(Boolean);
  };
  //to get the selected description
  const handleSelectDescription = (desc) => {
    setDescription(desc);
    setShowAIModal(false);
    toast.success('Description selected!');
  };
  //-------for auto setiting token------
  useEffect(() => {
  if (price && !customTokenEdited) {
    setTokenAmount(Math.round(price * 0.05)); // 5%
  }
}, [price, customTokenEdited]);
  //----------------these are for the auto glow of required fields error seprately ---------
  //for dynamiic toastify errors
  const requiredFields = [
    { key: 'landtype', label: 'Property Type', value: landtype },
    { key: 'state', label: 'State', value: state },
    { key: 'city', label: 'City', value: city },
    { key: 'pincode', label: 'Pincode', value: pincode },
    { key: 'price', label: 'Price', value: price },
    { key: 'length', label: 'Length', value: length },
    { key: 'breadth', label: 'Breadth', value: breadth },
    { key: 'description', label: 'Description', value: description },
    { key: 'tokenAmount', label:'Token Money', value: tokenAmount },
    {
      key: 'coordinates',
      label: 'Map Location',
      value: coordinates && coordinates.lat && coordinates.lng,
    },
  ];

  const missingFields = requiredFields.filter((f) => !f.value);
  //for individual glow
  const fieldRefs = {
    landtype: useRef(null),
    state: useRef(null),
    city: useRef(null),
    pincode: useRef(null),
    price: useRef(null),
    length: useRef(null),
    breadth: useRef(null),
    description: useRef(null),
    coordinates: useRef(null),
    tokenAmount: useRef(null)
  };
  const [fieldErrors, setFieldErrors] = useState({});
  const getErrorClass = (key) => {
    if (fieldErrors[key]) {
      return `
      border-red-500 
      ring-2 ring-red-500 
      shadow-[0_0_20px_rgba(239,68,68,0.7)] 
      animate-pulse
      transition-all duration-300
    `;
    }

    return 'border-white/10';
  };
  //for documents glow
  const getDocErrorClass = (doc) =>
    docErrors[doc]
      ? 'border-red-500 ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse'
      : 'border-white/10';
  const navigate = useNavigate();
  //for declaration
  const handleAgreedChange = () => {
    setAgreed(!agreed);

    // remove error instantly when user fixes it
    if (declarationError) {
      setDeclarationError(false);
    }
  };
  //------------------this is for step based architecture of form filling---------------------
  // Form validation for each step
  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!landtype) errors.landtype = true;
      if (!state) errors.state = true;
      if (!city) errors.city = true;
      if (!pincode) errors.pincode = true;
      if (!price) errors.price = true;
      if (!length) errors.length = true;
      if (!breadth) errors.breadth = true;
      if (!description) errors.description = true;
      if (!coordinates?.lat || !coordinates?.lng) errors.coordinates = true;
      if (!tokenAmount) errors.tokenAmount = true;
    }

    if (step === 2) {
      if (!image || !(image instanceof File)) {
        errors.mainImage = true;
      }
    }

    if (step === 3) {
      const newDocErrors = {};

      const requiredDocs = [
        'Aadhaar',
        'Pan',
        'LandRegistry',
        'EncumbranceCertificate',
        'Khata',
        'PropertyTax',
        'SurveyMap',
        'Noc',
        'OwnerPhoto',
      ];

      requiredDocs.forEach((doc) => {
        if (!documents[doc]) {
          newDocErrors[doc] = true;
        }
      });

      setDocErrors(newDocErrors);

      // optional: declaration validation
      if (!agreed) {
        setDeclarationError(true);
      }
    }
    if (Object.keys(errors).length > 0) {
      setTimeout(() => setFieldErrors({}), 2000);
    }
    setFieldErrors(errors);
    return errors;
  };
  const nextStep = () => {
    const errors = validateStep(currentStep);

    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];

      fieldRefs[firstKey]?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      return;
    }

    setCurrentStep((prev) => prev + 1);
  };
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  //fucntions to handle the steps
  const getStep1Progress = () => {
    let total = 10// updated
    let filled = 0;

    if (landtype) filled++;
    if (state) filled++;
    if (city) filled++;
    if (pincode) filled++;
    if (price) filled++;
    if (length) filled++;
    if (breadth) filled++;
    if (description) filled++; // NEW
    if (coordinates && coordinates.lat && coordinates.lng) filled++; // NEW
if (tokenAmount) filled++;
    return Math.round((filled / total) * 100);
  };
  const getStep2Progress = () => {
    return image ? 100 : 0;
  };
  const getStep3Progress = () => {
    let progress = 0;

    // Declaration = 50%
    if (agreed) progress += 50;

    // Optional docs uploaded = 50%
    const hasDocs = Object.values(documents).some(
      (val) => val && (Array.isArray(val) ? val.length > 0 : true),
    );

    if (hasDocs) progress += 50;

    return progress;
  };
  const step1Progress = getStep1Progress();
  const step2Progress = getStep2Progress();
  const step3Progress = getStep3Progress();
  const overallProgress = Math.round(
    (step1Progress / 100) * 33 + (step2Progress / 100) * 33 + (step3Progress / 100) * 34,
  );

  //------------------this is for the document upload and final land creation section ----------
  //function tto handle document uploads

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No token found. Please login.');
      return;
    }
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setOwner(decodedToken.userId);
  }, []);

  const handleDocChange = (e) => {
    const { name, files } = e.target;

    if (files.length > 1) {
      setDocuments({ ...documents, [name]: Array.from(files) });
    } else {
      setDocuments({ ...documents, [name]: files[0] });
    }

    // ✅ REMOVE GLOW instantly when user uploads
    if (docErrors[name]) {
      setDocErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const uploadData = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error('Please upload the main land image.');
      return;
    }
    if (!agreed) {
      toast.error('⚠️ Please accept the declaration before proceeding.');

      setDeclarationError(true);

      // Auto scroll
      document.getElementById('declarationBox')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Remove glow after 2 sec
      setTimeout(() => setDeclarationError(false), 2000);

      return;
    }
    // ------------------ DOCUMENT VALIDATION (GLOW ONLY) ------------------
    const requiredDocs = [
      'Aadhaar',
      'Pan',
      'LandRegistry',
      'EncumbranceCertificate',
      'Khata',
      'PropertyTax',
      'SurveyMap',
      'Noc',
      'OwnerPhoto',
    ];

    let newDocErrors = {};

    requiredDocs.forEach((doc) => {
      if (!documents[doc]) {
        newDocErrors[doc] = true;
      }
    });

    if (Object.keys(newDocErrors).length > 0) {
      setDocErrors(newDocErrors);

      toast.error('⚠️ Please upload required documents');

      // scroll to first missing doc
      const firstKey = Object.keys(newDocErrors)[0];
      document.getElementsByName(firstKey)[0]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // remove glow after 2 sec
      setTimeout(() => setDocErrors({}), 2000);

      return; // 🚫 STOP upload
    }
    setLoading(true);
    setProgress(0);

    const token = localStorage.getItem('token');

    try {
      // ------------------ UPLOAD LAND ------------------
      const formData = new FormData();
      formData.append('landtype', landtype);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('pincode', pincode);
      formData.append('image', image);
      formData.append('owner', owner);
      formData.append('price', price);
      formData.append('length', length);
      formData.append('breadth', breadth);
      formData.append('description', description);
      formData.append('latitude', coordinates.lat);
      formData.append('longitude', coordinates.lng);
      formData.append('declarationAccepted', agreed);
      formData.append('tokenAmount', tokenAmount);
      if (!coordinates) {
        toast.error('Please select land location on map.');
        setLoading(false);
        return;
      }
      const landRes = await axios.post('http://localhost:5000/create-land', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 50) / event.total);
          // 50% for land image upload
          setProgress(percent);
        },
      });

      const landId = landRes.data.land?._id;
      if (!landId) throw new Error('Failed to get Land ID');

      // ------------------ UPLOAD DOCUMENTS ------------------
      const docForm = new FormData();
      Object.keys(documents).forEach((key) => {
        const value = documents[key];
        if (!value) return;
        if (Array.isArray(value)) {
          value.forEach((file) => {
            if (file) docForm.append(key, file);
          });
        } else {
          docForm.append(key, value);
        }
      });

      await axios.post(
        `http://localhost:5000/api/lands/documents/upload/${landId}`,
        docForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (event) => {
            const percent = 50 + Math.round((event.loaded * 50) / event.total);
            // Remaining 50% for documents upload
            setProgress(percent);
          },
        },
      );

      toast.success('Land + Documents uploaded successfully!');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Error uploading land or documents.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  //ocr extraction function 
const isHindiText = (text) => {
  return /[\u0900-\u097F]/.test(text || "");
};

const handleSaleDeedUpload = async () => {
  console.log("BUTTON CLICKED");

  if (!saleDeedFiles || saleDeedFiles.length === 0) {
    toast.error("Upload Sale Deed images first");
    return;
  }

  const formData = new FormData();
  saleDeedFiles.forEach(file => formData.append("files", file));

  try {
    setOcrLoading(true);

    const res = await axios.post(
      "http://localhost:5000/api/documents/extract",
      formData
    );

    console.log("RESPONSE:", res.data);

    let data = res.data;

    // ✅ APPLY TRANSLITERATION ONLY WHEN NEEDED
    if (data.transliterated) {
      data = {
        ...data,

        ownerName: {
          ...data.ownerName,
          value: isHindiText(data.ownerName?.value)
            ? data.transliterated.ownerName_en || data.ownerName?.value
            : data.ownerName?.value
        },

        buyerName: {
          ...data.buyerName,
          value: isHindiText(data.buyerName?.value)
            ? data.transliterated.buyerName_en || data.buyerName?.value
            : data.buyerName?.value
        },

        city: {
          ...data.city,
          value: isHindiText(data.city?.value)
            ? data.transliterated.city_en || data.city?.value
            : data.city?.value
        },

        state: {
          ...data.state,
          value: isHindiText(data.state?.value)
            ? data.transliterated.state_en || data.state?.value
            : data.state?.value
        },

        village: {
          ...data.village,
          value: isHindiText(data.village?.value)
            ? data.transliterated.village_en || data.village?.value
            : data.village?.value
        }
      };
    }

    setExtractionData(data);
    setShowExtractionModal(true);

  } catch (err) {
    console.error("OCR ERROR:", err);
    toast.error("OCR failed, fill manually");
    setCurrentStep(1);
  } finally {
    setOcrLoading(false);
  }
};
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 overflow-hidden pt-12">
      {/* Enhanced Background with Multiple Layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23ffffff' stroke-width='0.5' fill-opacity='0.2'/%3E%3Ccircle cx='30' cy='30' r='20' fill='none' stroke='%23ffffff' stroke-width='0.3' fill-opacity='0.1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-transparent to-cyan-900/30 animate-pulse"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Premium Full Page Loader */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <div className="relative mb-12">
            <div className="w-24 h-24 border-4 border-emerald-400/10 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin"></div>
            <div
              className="absolute top-2 left-2 w-20 h-20 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"
              style={{ animationDirection: 'reverse' }}
            ></div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Creating Your Premium Listing
            </h2>
            <p className="text-emerald-400">
              Please wait while we process your information...
            </p>
          </div>

          <div className="w-96 h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm mb-4">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 transition-all duration-500 shadow-lg"
              style={{
                width: `${progress}%`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
              }}
            />
          </div>
          <div className="text-emerald-400 font-bold text-xl">{progress}% Complete</div>
        </div>
      )}
{/* Step 0: Sale Deed Upload */}
{/* Step 0: Sale Deed Upload */}
{currentStep === 0 && (
  <div className="relative z-10 min-h-screen flex flex-col">

    {/* HEADER (compact) */}
    <div className="text-center pt-8 pb-6 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Step Indicator */}
        <div className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-400/30 rounded-full text-emerald-400 text-xs font-semibold mb-5 backdrop-blur-sm">
          <span className="mr-2">STEP 1 OF 3</span>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-1 bg-emerald-400 rounded-full"></div>
            <div className="w-6 h-1 bg-white/30 rounded-full"></div>
            <div className="w-6 h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Sale Deed OCR
        </h1>

        <p className="text-sm md:text-base text-gray-400">
          Upload images to auto-extract property details.{" "}
          <span className="text-white font-semibold">
            Multiple images supported
          </span>
        </p>
      </div>
    </div>

    {/* CONTENT */}
    <div className="flex-1 max-w-4xl mx-auto px-6 pb-10">

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 md:p-8">

        <div className="border border-dashed border-emerald-400/25 rounded-2xl p-10 text-center bg-emerald-500/5">

          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <FaUpload className="w-10 h-10 text-emerald-400" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            Upload Sale Deed Images
          </h3>

          <p className="text-sm text-gray-400 mb-5">
            You can upload multiple images for better accuracy
          </p>

          {/* FILE INPUT */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setSaleDeedFiles([...e.target.files])}
            className="hidden"
            id="saleDeedUpload"
          />

          <label
            htmlFor="saleDeedUpload"
            className="cursor-pointer px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:scale-105 transition inline-flex items-center gap-2"
          >
            <FaUpload />
            Select Files
          </label>

          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG supported
          </p>

          {/* HIGHLIGHT */}
          <p className="text-xs mt-2">
            <span className="text-emerald-400 font-semibold">
              Multiple images recommended
            </span>
          </p>

          {/* FILE PREVIEW */}
          {saleDeedFiles?.length > 0 && (
            <div className="mt-5 p-4 bg-emerald-500/10 border border-emerald-400/20 rounded-xl">
              <p className="text-emerald-400 text-sm font-medium">
                {saleDeedFiles.length} file(s) selected
              </p>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between items-center mt-6">

          <button
            onClick={() => setCurrentStep(1)}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            <span className="font-semibold text-emerald-400">
              Skip manually →
            </span>
          </button>

          <button
            type="button"
            onClick={handleSaleDeedUpload}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition"
          >
            {ocrLoading ? "Scanning..." : "Upload & Scan"}
          </button>

        </div>

      </div>
    </div>
  </div>
)}
{/* modal for extration to showcase info */}
{showExtractionModal && extractionData && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 px-4">
    
    <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-white/10 backdrop-blur-xl p-8 rounded-3xl w-full max-w-2xl shadow-2xl animate-fadeIn">

      {/* HEADER */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Verify Extracted Information
        </h2>
        <p className="text-gray-400 text-sm md:text-base">
          Please review and update the fields if required before continuing
        </p>
      </div>

      {/* FORM GRID */}
      <div className="space-y-5">

        {/* OWNER */}
        <div>
          <label className="text-xs text-gray-400">Owner Name</label>
          <input
            value={extractionData.ownerName?.value || ""}
            onChange={(e) =>
              setExtractionData({
                ...extractionData,
                ownerName: {
                  ...extractionData.ownerName,
                  value: e.target.value
                }
              })
            }
            className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-400 outline-none"
          />
          {extractionData.original?.ownerName_hi && (
            <p className="text-xs text-gray-500 mt-1">
              Original: {extractionData.original.ownerName_hi}
            </p>
          )}
        </div>

        {/* CITY */}
        <div>
          <label className="text-xs text-gray-400">City</label>
          <input
            value={extractionData.city?.value || ""}
            onChange={(e) =>
              setExtractionData({
                ...extractionData,
                city: {
                  ...extractionData.city,
                  value: e.target.value
                }
              })
            }
            className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-400 outline-none"
          />
          {extractionData.original?.city_hi && (
            <p className="text-xs text-gray-500 mt-1">
              Original: {extractionData.original.city_hi}
            </p>
          )}
        </div>

        {/* STATE */}
        <div>
          <label className="text-xs text-gray-400">State</label>
          <input
            value={extractionData.state?.value || ""}
            onChange={(e) =>
              setExtractionData({
                ...extractionData,
                state: {
                  ...extractionData.state,
                  value: e.target.value
                }
              })
            }
            className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-400 outline-none"
          />
          {extractionData.original?.state_hi && (
            <p className="text-xs text-gray-500 mt-1">
              Original: {extractionData.original.state_hi}
            </p>
          )}
        </div>

        {/* PINCODE */}
        <div>
          <label className="text-xs text-gray-400">Pincode</label>
          <input
            value={extractionData.pincode?.value || ""}
            onChange={(e) =>
              setExtractionData({
                ...extractionData,
                pincode: {
                  ...extractionData.pincode,
                  value: e.target.value
                }
              })
            }
            className="w-full mt-1 p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-400 outline-none"
          />
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 mt-8">

        {/* BACK */}
        <button
          onClick={() => setShowExtractionModal(false)}
          className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition"
        >
          ← Back
        </button>

        {/* CONFIRM */}
        <button
          onClick={() => {
            setCity(extractionData.city?.value || "");
            setState(extractionData.state?.value || "");
            setPincode(extractionData.pincode?.value || "");

            setShowExtractionModal(false);
            setCurrentStep(1);
          }}
          className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:scale-105 transition shadow-lg"
        >
          Confirm & Continue →
        </button>
      </div>

    </div>
  </div>
)}
      {/* Step 1: Land Details - Professional Full Screen */}
      {currentStep === 1 && (
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Professional Header */}
          <div className="text-center py-12 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Step Indicator */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 rounded-full text-emerald-400 text-sm font-bold mb-8 backdrop-blur-sm shadow-lg">
                <FaHome className="w-5 h-5 mr-3" />
                <span className="mr-3">STEP 1 OF 3</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-emerald-400 rounded-full"></div>
                  <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                  <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Property
                <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mt-3 bg-gradient-to-r animate-pulse">
                  Information
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Provide comprehensive details about your premium property to attract the
                right buyers
              </p>

              {/* Trust Badges */}
              <div className="flex justify-center gap-8 mt-8">
                <div className="flex items-center gap-2 text-emerald-400">
                  <FaShieldAlt className="w-5 h-5" />
                  <span className="text-sm font-medium">Secure</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <FaAward className="w-5 h-5" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <FaChartLine className="w-5 h-5" />
                  <span className="text-sm font-medium">Premium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Progress Section */}
          <div className="max-w-5xl mx-auto px-8 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <FaHome className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Property Details</h3>
                    <p className="text-gray-400 text-sm">
                      Basic information about your land
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-2xl">
                    {overallProgress}%
                  </div>
                  <div className="text-gray-400 text-sm">Complete</div>
                </div>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700 shadow-lg"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Professional Form Content */}
          <div className="flex-1 max-w-5xl mx-auto px-8 pb-16">
            <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl p-10 md:p-14">
              {/* Form Sections with Icons */}
              <div className="space-y-8">
                {/* Property Type Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mr-3">
                      {landtype === 'residential' && (
                        <FaHome className="w-5 h-5 text-emerald-400" />
                      )}
                      {landtype === 'industrial' && (
                        <FaBuilding className="w-5 h-5 text-emerald-400" />
                      )}
                      {landtype === 'agricultural' && (
                        <FaTree className="w-5 h-5 text-emerald-400" />
                      )}
                      {!landtype && <FaHome className="w-5 h-5 text-gray-400" />}
                    </div>
                    <h3 className="text-xl font-bold text-white">Property Type</h3>
                  </div>
                  <select
                    value={landtype}
                    ref={fieldRefs.landtype}
                    onChange={(e) => setLandtype(e.target.value)}
                    className={`w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 text-lg${getErrorClass('landtype')} `}
                  >
                    <option value="" disabled className="bg-slate-800">
                      Select Property Type
                    </option>
                    <option value="residential" className="bg-slate-800">
                      🏠 Residential
                    </option>
                    <option value="industrial" className="bg-slate-800">
                      🏢 Industrial
                    </option>
                    <option value="agricultural" className="bg-slate-800">
                      🌳 Agricultural
                    </option>
                  </select>
                </div>
                {/* Location Section */}
                <div
                  ref={fieldRefs.state}
                  className={`bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20 ${
                    fieldErrors.state || fieldErrors.city
                      ? 'ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                      : ''
                  }`}
                >
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>📍</span> Select State & City
                  </h3>

                  <StateCitySelector
                    state={state}
                    city={city}
                    onChange={({ state, city }) => {
                      setState(state);
                      setCity(city);

                      if (fieldErrors.state || fieldErrors.city) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          state: false,
                          city: false,
                        }));
                      }

                      const cityObj = locationData.find(
                        (c) => c.State === state && c.Location === city,
                      );

                      if (cityObj?.Latitude && cityObj?.Longitude) {
                        setMapCenter({ lat: cityObj.Latitude, lng: cityObj.Longitude });
                      } else if (state) {
                        setMapCenter({ lat: 20.5937, lng: 78.9629 });
                      }
                    }}
                  />
                </div>

                {/* Property Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center mb-4">
                      <FaEnvelope className="w-5 h-5 text-emerald-400 mr-3" />
                      <h3 className="text-lg font-bold text-white">Pincode</h3>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter pincode"
                      value={pincode}
                      ref={fieldRefs.pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className={`w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 text-lg ${getErrorClass('pincode')}`}
                    />
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center mb-4">
                      <FaRupeeSign className="w-5 h-5 text-emerald-400 mr-3" />
                      <h3 className="text-lg font-bold text-white">Price (₹)</h3>
                    </div>
                    <input
                      type="number"
                      placeholder="Enter price"
                      value={price}
                      ref={fieldRefs.price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 text-lg ${getErrorClass('price')}`}
                    />
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center mb-4">
                      <FaRulerCombined className="w-5 h-5 text-emerald-400 mr-3" />
                      <h3 className="text-lg font-bold text-white">Dimensions</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Length"
                        value={length}
                        ref={fieldRefs.length}
                        onChange={(e) => setLength(e.target.value)}
                        className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 ${getErrorClass('length')}`}
                      />
                      <input
                        type="number"
                        placeholder="Breadth"
                        value={breadth}
                        ref={fieldRefs.breadth}
                        onChange={(e) => setBreadth(e.target.value)}
                        className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 ${getErrorClass('breadth')}`}
                      />
                    </div>
                  </div>
                </div>
<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
  <div className="flex items-center mb-4">
    <FaRupeeSign className="w-5 h-5 text-emerald-400 mr-3" />
    <h3 className="text-lg font-bold text-white">
      Token Money (Editable)
    </h3>
  </div>

  <input
    type="number"
    value={tokenAmount}
    ref={fieldRefs.tokenAmount}
    onChange={(e)=>{
      setTokenAmount(e.target.value);
      setCustomTokenEdited(true);
    }}
    placeholder="Auto 5% or edit manually"
    className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white"
  />

  <p className="text-xs text-gray-400 mt-2">
    Suggested default: 5% of property value
  </p>
</div>
                {/* Description Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FaFileAlt className="w-5 h-5 text-emerald-400 mr-3" />
                      <h3 className="text-lg font-bold text-white">
                        Property Description
                      </h3>
                    </div>

                    {/* AI Generate Button */}
                    <button
                      onClick={() => setShowPromptModal(true)}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow hover:scale-105 transition"
                    >
                      ✨ AI Generate
                    </button>
                  </div>

                  {/* TEXTAREA */}
                  <textarea
                    placeholder="Describe your property in detail to attract potential buyers..."
                    value={description}
                    ref={fieldRefs.description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="5"
                    className={`w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 text-lg resize-none ${getErrorClass('description')}`}
                  />
                </div>
                {/* description  Preview */}
                {showPromptModal && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
                    <div className="bg-slate-900 p-6 md:p-8 rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl">
                      {/* Header */}
                      <h2 className="text-2xl font-bold text-white mb-6">
                        ✨ AI Description Generator
                      </h2>

                      {/* LAND DETAILS (Compact Grid View) */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white/5 p-4 rounded-xl border border-white/10 mb-6 text-sm">
                        <div>
                          <p className="text-gray-400">Type</p>
                          <p className="text-white font-medium">{landtype || '-'}</p>
                        </div>

                        <div>
                          <p className="text-gray-400">Location</p>
                          <p className="text-white font-medium">
                            {city || '-'}, {state || '-'}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-400">Price</p>
                          <p className="text-white font-medium">₹{price || '-'}</p>
                        </div>

                        <div>
                          <p className="text-gray-400">Length</p>
                          <p className="text-white font-medium">{length || '-'}</p>
                        </div>

                        <div>
                          <p className="text-gray-400">Breadth</p>
                          <p className="text-white font-medium">{breadth || '-'}</p>
                        </div>

                        <div>
                          <p className="text-gray-400">Status</p>
                          <p className="text-emerald-400 font-medium">Ready</p>
                        </div>
                      </div>

                      {/* STEP INSTRUCTIONS (CLEAR FLOW) */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                        <h3 className="text-white font-semibold mb-3">How it works</h3>

                        <ol className="text-gray-300 text-sm space-y-2 list-decimal ml-5">
                          <li>
                            Click{' '}
                            <span className="text-emerald-400 font-medium">
                              Open ChatGPT
                            </span>
                          </li>
                          <li>
                            If prompt is not auto-filled → click{' '}
                            <span className="text-blue-400 font-medium">Copy Prompt</span>
                          </li>
                          <li>Paste prompt in ChatGPT and generate response</li>
                          <li>Copy full response from ChatGPT</li>
                          <li>
                            Come back and click{' '}
                            <span className="text-purple-400 font-medium">
                              Paste AI Response
                            </span>
                          </li>
                        </ol>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                          onClick={openChatGPT}
                          className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all"
                        >
                          🚀 Open ChatGPT
                        </button>

                        <button
                          onClick={copyPrompt}
                          className="py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all"
                        >
                          📋 Copy Prompt
                        </button>
                      </div>

                      {/* FINAL ACTION */}
                      <button
                        onClick={pasteFromClipboard}
                        className="w-full mt-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-all"
                      >
                        📥 Paste AI Response (Auto Fill Description)
                      </button>

                      {/* CANCEL */}
                      <button
                        onClick={() => setShowPromptModal(false)}
                        className="w-full mt-4 text-gray-400 text-sm hover:text-white transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {/* final description Preview */}
                {showAIModal && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    {/* Reduced overall height so everything fits in one screen */}
                    <div className="bg-slate-900/95 p-8 rounded-3xl w-full max-w-7xl border border-white/10 shadow-2xl max-h-[90vh] flex flex-col">
                      <h2 className="text-2xl font-bold text-white mb-6 text-center shrink-0">
                        Choose a Description
                      </h2>

                      {/* Grid grows but doesn't overflow whole modal */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 flex-1 overflow-hidden">
                        {aiDescriptions.map((desc, index) => {
                          const titles = [
                            '✨ Premium Style',
                            '📈 Investment Focus',
                            '📄 Simple Overview',
                          ];

                          return (
                            <div
                              key={index}
                              className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-emerald-400/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300 flex flex-col"
                            >
                              <h4 className="text-emerald-400 font-semibold mb-3 text-lg shrink-0">
                                {titles[index]}
                              </h4>

                              {/* SCROLL AREA (fixed height ~250px) */}
                              <div className="flex-1 max-h-[250px] overflow-y-auto pr-2">
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                                  {desc}
                                </p>
                              </div>

                              <button
                                onClick={() => {
                                  handleSelectDescription(desc);
                                  setShowAIModal(false);
                                  setShowPromptModal(false);
                                }}
                                className="mt-4 w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-emerald-500/30 shrink-0"
                              >
                                Use This
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Always visible (no scroll needed) */}
                      <button
                        onClick={() => setShowAIModal(false)}
                        className="mt-6 text-gray-400 text-sm hover:text-white transition self-center shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {/* ---------------- MAP PICKER ---------------- */}
                <div
                  ref={fieldRefs.coordinates}
                  className={`bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-md border ${getErrorClass('coordinates')}`}
                >
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    Select Land Location on Map
                  </h3>

                  <MapPicker center={mapCenter} setCoordinates={setCoordinates} />

                  {coordinates && (
                    <p>
                      Selected: Lat {coordinates.lat}, Lng {coordinates.lng}
                    </p>
                  )}
                </div>
              </div>

              {/* Professional Navigation */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                <div className="text-gray-400 text-sm">1 of 3 steps completed</div>
                <button
                  type="button"
                  onClick={nextStep}
                  className="group px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 flex items-center gap-3 text-lg"
                >
                  Continue to Images
                  <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Main Image - Professional Full Screen */}
      {currentStep === 2 && (
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Professional Header */}
          <div className="text-center py-12 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Step Indicator */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 rounded-full text-emerald-400 text-sm font-bold mb-8 backdrop-blur-sm shadow-lg">
                <FaImage className="w-5 h-5 mr-3" />
                <span className="mr-3">STEP 2 OF 3</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-emerald-400 rounded-full"></div>
                  <div className="w-8 h-1 bg-emerald-400 rounded-full"></div>
                  <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Property
                <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mt-3 bg-gradient-to-r animate-pulse">
                  Photography
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Upload high-quality images to showcase your property's best features
              </p>
            </div>
          </div>

          {/* Enhanced Progress Section */}
          <div className="max-w-5xl mx-auto px-8 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <FaImage className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Property Images</h3>
                    <p className="text-gray-400 text-sm">
                      Visual representation of your property
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-2xl">
                    {overallProgress}%
                  </div>
                  <div className="text-gray-400 text-sm">Complete</div>
                </div>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700 shadow-lg"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Professional Upload Content */}
          <div className="flex-1 max-w-5xl mx-auto px-8 pb-16">
            <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl p-10 md:p-14">
              <div className="border-3 border-dashed border-emerald-400/20 rounded-3xl p-16 text-center hover:border-emerald-400/40 transition-all duration-500 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5">
                <div className="w-32 h-32 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <FaUpload className="w-16 h-16 text-emerald-400" />
                </div>

                <h3 className="text-3xl font-bold text-white mb-4">
                  Upload Property Images
                </h3>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  High-quality photos increase property visibility by 85%
                </p>

                <div
                  className={`flex flex-col items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${getErrorClass('mainImage')}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="hidden"
                    id="mainImage"
                  />

                  <label
                    htmlFor="mainImage"
                    className="cursor-pointer px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 inline-flex items-center gap-3 text-lg"
                  >
                    <FaUpload />
                    Choose Main Image
                  </label>

                  <p className="text-gray-400 text-sm">
                    or drag and drop your files here
                  </p>
                </div>

                {image && (
                  <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl">
                    <div className="flex items-center justify-center gap-3">
                      <FaCheckCircle className="w-6 h-6 text-emerald-400" />
                      <span className="text-emerald-400 font-bold text-lg">
                        Selected: {image.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Image Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📷</span>
                    </div>
                    <h4 className="text-white font-bold mb-1">High Resolution</h4>
                    <p className="text-gray-400 text-sm">Minimum 1920x1080px</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🏞️</span>
                    </div>
                    <h4 className="text-white font-bold mb-1">Clear Views</h4>
                    <p className="text-gray-400 text-sm">Show all property features</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">☀️</span>
                    </div>
                    <h4 className="text-white font-bold mb-1">Good Lighting</h4>
                    <p className="text-gray-400 text-sm">Natural light recommended</p>
                  </div>
                </div>
              </div>

              {/* Professional Navigation */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                <button
                  type="button"
                  onClick={prevStep}
                  className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center gap-3 text-lg"
                >
                  <FaArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Back to Details
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="group px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 flex items-center gap-3 text-lg"
                >
                  Continue to Documents
                  <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Documents - Professional Full Screen */}
      {currentStep === 3 && (
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Professional Header */}
          <div className="text-center py-12 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Step Indicator */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 rounded-full text-emerald-400 text-sm font-bold mb-8 backdrop-blur-sm shadow-lg">
                <FaFolderOpen className="w-5 h-5 mr-3" />
                <span className="mr-3">STEP 3 OF 3</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-emerald-400 rounded-full"></div>
                  <div className="w-8 h-1 bg-emerald-400 rounded-full"></div>
                  <div className="w-8 h-1 bg-emerald-400 rounded-full"></div>
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Legal
                <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mt-3 bg-gradient-to-r animate-pulse">
                  Documentation
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Complete your property listing with necessary legal documents
              </p>
            </div>
          </div>

          {/* Enhanced Progress Section */}
          <div className="max-w-5xl mx-auto px-8 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <FaFolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Legal Documents</h3>
                    <p className="text-gray-400 text-sm">
                      Required paperwork for property verification
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-2xl">
                    {overallProgress}%
                  </div>
                  <div className="text-gray-400 text-sm">Complete</div>
                </div>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-700 shadow-lg"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Professional Documents Form */}
          <form onSubmit={uploadData} className="flex-1 max-w-5xl mx-auto px-8 pb-16">
            <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl shadow-2xl p-10 md:p-14">
              {/* Essential Documents */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaShieldAlt className="w-6 h-6 text-emerald-400" />
                  Essential Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    'Aadhaar',
                    'Pan',
                    'SaleDeed',
                    'LandRegistry',
                    'EncumbranceCertificate',
                    'Khata',
                    'PropertyTax',
                    'SurveyMap',
                    'Noc',
                    'OwnerPhoto',
                  ].map((doc) => (
                    <div
                      key={doc}
                      className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 hover:border-emerald-400/30 ${getDocErrorClass(doc)}`}
                    >
                      <label className="block text-emerald-400 font-bold mb-3 text-lg">
                        {doc
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())}
                      </label>
                      <input
                        type="file"
                        name={doc}
                        onChange={handleDocChange}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Documents */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaFolderOpen className="w-6 h-6 text-emerald-400" />
                  Additional Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-400/30 transition-all duration-300">
                    <label className="block text-emerald-400 font-bold mb-3 text-lg">
                      Additional Property Photos
                    </label>
                    <input
                      type="file"
                      name="LandPhotos"
                      multiple
                      onChange={handleDocChange}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 transition-all duration-300"
                    />
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-400/30 transition-all duration-300">
                    <label className="block text-emerald-400 font-bold mb-3 text-lg">
                      Utility Bills
                    </label>
                    <input
                      type="file"
                      name="Bills"
                      multiple
                      onChange={handleDocChange}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
              {/* SELF DECLARATION */}
              <div
                id="declarationBox"
                className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border mt-8 transition-all duration-300
  ${
    declarationError
      ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-shake'
      : 'border-white/10'
  }`}
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  Declaration & Disclaimer
                </h3>

                <div className="text-gray-300 text-sm space-y-3 leading-relaxed">
                  <p>
                    I hereby declare that I am the lawful owner or legally authorized
                    representative of this property and that all information provided by
                    me is true, complete, and accurate to the best of my knowledge.
                  </p>

                  <p>
                    I confirm that all documents uploaded are genuine, valid, and belong
                    to the stated property. I further declare that there are no
                    undisclosed disputes, claims, encumbrances, or legal proceedings
                    associated with this property.
                  </p>

                  <p>
                    By submitting this form, I accept full responsibility for the
                    correctness of the data submitted.
                  </p>

                  <p>
                    I agree that in case any information is found to be false, misleading,
                    or fraudulent, my account may be suspended or permanently terminated,
                    and the matter may be reported to the appropriate legal authorities.
                  </p>

                  <p className="text-red-400 font-semibold">
                    ⚠️ <strong>Legal Warning:</strong> Submission of false information or
                    forged documents is a criminal offense under applicable Indian laws,
                    including:
                    <br />• <strong>IPC Section 420</strong> – Cheating (up to 7 years
                    imprisonment + fine)
                    <br />• <strong>IPC Section 465</strong> – Forgery (up to 2 years
                    imprisonment + fine)
                    <br />• <strong>IPC Section 468</strong> – Forgery for purpose of
                    cheating (up to 7 years imprisonment + fine)
                    <br />• <strong>IPC Section 471</strong> – Using forged documents as
                    genuine
                  </p>
                </div>

                <div className="flex items-center mt-5 gap-3">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={handleAgreedChange}
                    className={`w-5 h-5 accent-emerald-500 transition-all duration-300
    ${declarationError ? 'ring-2 ring-red-500' : ''}
  `}
                  />
                  <label className="text-white text-sm">
                    I have read, understood, and agree to the above declaration and
                    disclaimer
                  </label>
                </div>
              </div>
              {/* Professional Navigation */}
              <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                <button
                  type="button"
                  onClick={prevStep}
                  className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center gap-3 text-lg"
                >
                  <FaArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Back to Images
                </button>
                <button
                  type="submit"
                  className="group px-12 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105 flex items-center gap-3 text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Creating Listing...
                    </>
                  ) : (
                    <>
                      <FaAward />
                      Create Premium Listing
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CreateLand;
