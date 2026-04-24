import { AuthContext } from '../../../contexts/authContext';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaHeart, FaEye, FaCheckCircle } from 'react-icons/fa';
import { API } from '../../../utils/API';
import { getFileUrl } from '../../../../backend/utils/getFileUrl.js';

import Hero from '../LandingPage/Hero';
import Features from '../LandingPage/Features';
import HowItWorks from '../LandingPage/HowItWorks';
import Testimonials from '../LandingPage/Testimonials';
import BackToTop from '../BackToTop';

const LawyerHome = () => {
  const { user } = useContext(AuthContext);
  const [lands, setLands] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  //states for veriying user uploaded docs
  const [userDocs, setUserDocs] = useState([]);
  const [docLoading, setDocLoading] = useState(true);
  const [selectedUserDocs, setSelectedUserDocs] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  //lawyerdeclaration
  const [lawyerDeclarationAccepted, setLawyerDeclarationAccepted] = useState(false);
  const [lawyerDeclarationError, setLawyerDeclarationError] = useState(false);
  const openUserDocs = (docGroup) => {
    setSelectedUserDocs(docGroup);
    setIsModalOpen(true);

    // preload declaration status
    if (docGroup.lawyerDeclaration?.accepted) {
      setLawyerDeclarationAccepted(true);
    } else {
      setLawyerDeclarationAccepted(false);
    }
  };
  // Fetch all lands for lawyers
  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== 'lawyer') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchLands = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/lands/get-land', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const allLands = Array.isArray(data.data) ? data.data : [];
        setLands(allLands);
      } catch (error) {
        console.error('Error fetching lands:', error);
        toast.error('Failed to fetch lands.');
        setLands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLands();
  }, [user]);
  const token = localStorage.getItem('token');
  if (!token) return;
  //to update the status of each doc
  const updateUserDocStatus = async (parentId, status, childId = null) => {
    const token = localStorage.getItem('token');
    if (!token) return toast.error('Login required');

    try {
      const res = await API.put(
        `/api/users/file/${parentId}/${status}`,
        { childId }, // childId is optional for individual updates
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const updatedParent = res.data.parentDoc;

      // Update userDocs state
      setUserDocs((prev) =>
        prev.map((userDoc) =>
          userDoc._id === updatedParent._id ? { ...updatedParent } : userDoc,
        ),
      );

      // Update selectedUserDocs (modal)
      setSelectedUserDocs((prev) =>
        prev && prev._id === updatedParent._id ? { ...updatedParent } : prev,
      );

      toast.success(`Document ${status} ✅`);
    } catch (err) {
      console.error('User doc update error:', err);
      toast.error('Failed to update document');
    }
  };
  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== 'lawyer') return;

    //function to get userdocs
    const fetchUserDocs = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) return;
        const res = await fetch('http://localhost:5000/api/users/pending', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setUserDocs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching user docs:', err);
        toast.error('Failed to fetch user documents');
      } finally {
        setDocLoading(false);
      }
    };

    fetchUserDocs();
  }, [user]);
  //function for opening all docs separtely
  const flattenUserDocs = (docs) => {
    const flattened = docs.flatMap(
      (docGroup) =>
        docGroup.documents?.map((doc) => ({
          ...doc,
          parentId: docGroup._id,
          userId: docGroup.user?._id,
          userName: docGroup.user?.username,
          userEmail: docGroup.user?.email,
        })) || [],
    );

    return Array.from(new Map(flattened.map((d) => [d._id, d])).values());
  };

  const userDocGroups = userDocs;
  // Fetch wishlist
  useEffect(() => {
    if (!user) return;

    API.get(`/api/wishlist/${user._id}`)
      .then((res) => setWishlist(res.data[0]?.lands || []))
      .catch((err) => console.error('Error fetching wishlist:', err));
  }, [user]);

  const calculateAverageRating = (reviews) => {
    if (!reviews?.length) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Loading lands...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Hero />
      <Features />

      {/* All Lands Section for Lawyers */}
      {user?.role?.toLowerCase() === 'lawyer' && (
        <section className="py-20 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 relative overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
              All Lands
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lands
                .filter((land) => {
                  //  Hide approved lands
                  if (land.status === 'approved') return false;

                  //  NEW → visible to all lawyers
                  if (!land.assignedLawyer) return true;

                  //  UNDER REVIEW → only assigned lawyer
                  return (
                    land.assignedLawyer === user?._id ||
                    land.assignedLawyer?._id === user?._id
                  );
                })
                .map((land) => {
                  const averageRating = calculateAverageRating(land.reviews);
                  const isInWishlist = wishlist.includes(land._id);
                  const isHovered = hoveredCard === land._id;

                  return (
                    <div
                      key={land._id}
                      className="group relative"
                      onMouseEnter={() => setHoveredCard(land._id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {/* Card */}
                      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-700 overflow-hidden border border-white/20 hover:border-emerald-200/50">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br from-emerald-50/5 to-cyan-50/5 transition-opacity duration-700 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                        ></div>

                        <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                          {land.image ? (
                            <>
                              <img
                                src={getFileUrl(land.image)}
                                alt={land.landtype || 'land'}
                                className="w-full h-full object-cover transition-transform duration-700"
                                style={{
                                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center">
                              <FaMapMarkerAlt className="text-emerald-600 text-5xl" />
                            </div>
                          )}
                          {/* Dynamic Badge */}
                          <div className="absolute top-3 left-3">
                            {land.status === 'approved' ? (
                              <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                                <FaCheckCircle className="mr-1 text-xs" /> VERIFIED
                              </div>
                            ) : !land.assignedLawyer ? (
                              <div className="bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                                NEW
                              </div>
                            ) : (
                              <div className="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                                UNDER REVIEW
                              </div>
                            )}
                          </div>

                          <div
                            className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-500 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                          >
                            <Link
                              to={`/land/${land._id}`}
                              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                            >
                              <FaEye className="text-lg text-gray-600 hover:text-emerald-600 transition-colors" />
                            </Link>
                          </div>

                          {/* {land.status === "approved" && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                            <FaCheckCircle className="mr-1 text-xs" /> Verified
                          </div>
                        )} */}
                        </div>

                        <div className="p-4 sm:p-6 lg:p-8 relative z-10">
                          <div className="flex flex-col mb-3">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                              {land.city}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600">
                              by {land.ownerName || 'Unknown Owner'}
                            </p>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                              ₹{land.price?.toLocaleString()}
                            </div>
                            <Link
                              to={`/land/${land._id}`}
                              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg text-sm"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none`}
                      ></div>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}
      {/* user documents sections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            User Document Verification
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userDocGroups.map((docGroup) => (
              <div
                key={docGroup._id}
                className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {docGroup.user?.username}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{docGroup.user?.email}</p>

                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm text-gray-700 font-medium">
                    Documents:{' '}
                    <span className="font-semibold">
                      {docGroup.documents?.length || 0}
                    </span>
                  </p>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                ${
                  docGroup.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : docGroup.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                }`}
                  >
                    {docGroup.status}
                  </span>
                </div>

                <button
                  onClick={() => openUserDocs(docGroup)}
                  className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  View Documents
                </button>
              </div>
            ))}
          </div>

          {/* Modal for documents */}
          {isModalOpen && selectedUserDocs && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-4">
              <div className="bg-mintGreen border border-sand500 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-[95%] max-w-5xl max-h-[85vh] overflow-y-auto p-6 relative">
                {/* CLOSE */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 text-richBrown/60 hover:text-darkWalnut"
                >
                  ✖
                </button>

                {/* HEADER */}
                <h2 className="text-2xl font-bold text-darkWalnut mb-2">
                  {selectedUserDocs.user?.username}'s Documents
                </h2>
                <p className="text-sm text-richBrown/70 mb-6">
                  Verify user KYC documents carefully
                </p>

                {/* DOCUMENT GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedUserDocs.documents.map((doc) => {
                    const fileUrl = getFileUrl(doc.file);

                    return (
                      <div
                        key={doc._id}
                        className="border border-sand500 bg-lightTan rounded-xl p-3 hover:shadow-lg hover:shadow-sand500/30 transition"
                      >
                        <img
                          src={fileUrl}
                          alt={doc.type}
                          className="w-full h-40 object-cover rounded-lg mb-2"
                        />

                        <p className="text-center text-sm font-semibold text-darkWalnut">
                          {doc.type}
                        </p>

                        <div className="flex justify-center mt-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              doc.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : doc.status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {doc.status || 'pending'}
                          </span>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              if (!lawyerDeclarationAccepted) {
                                setLawyerDeclarationError(true);
                                return toast.error('Accept declaration first');
                              }
                              updateUserDocStatus(
                                selectedUserDocs._id,
                                'approved',
                                doc._id,
                              );
                            }}
                            disabled={doc.status !== 'pending'}
                            className="flex-1 bg-cardGreen text-darkWalnut py-1 rounded hover:bg-richBrown disabled:bg-gray-400 transition"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => {
                              if (!lawyerDeclarationAccepted) {
                                setLawyerDeclarationError(true);
                                return toast.error('Accept declaration first');
                              }
                              updateUserDocStatus(
                                selectedUserDocs._id,
                                'rejected',
                                doc._id,
                              );
                            }}
                            disabled={doc.status !== 'pending'}
                            className="flex-1 bg-red-600 text-white py-1 rounded hover:bg-red-700 disabled:bg-gray-400 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 🔥 LAWYER DECLARATION */}
                <div
                  className={`mt-6 p-5 rounded-2xl border ${
                    lawyerDeclarationError
                      ? 'border-red-500 animate-pulse'
                      : 'border-sand500 bg-lightTan'
                  }`}
                >
                  <p className="text-sm text-darkWalnut leading-relaxed">
                    I confirm that I have verified all user documents and they are genuine
                    to the best of my knowledge. I understand that approving incorrect or
                    fraudulent documents may lead to legal consequences.
                  </p>

                  <div className="flex items-center mt-4 gap-2">
                    <input
                      type="checkbox"
                      checked={lawyerDeclarationAccepted}
                      onChange={(e) => {
                        setLawyerDeclarationAccepted(e.target.checked);
                        setLawyerDeclarationError(false);
                      }}
                      disabled={selectedUserDocs.lawyerDeclaration?.accepted}
                      className="w-5 h-5 accent-cardGreen"
                    />
                    <label className="text-sm font-medium text-darkWalnut">
                      I accept responsibility for verification
                    </label>
                  </div>

                  {selectedUserDocs.lawyerDeclaration?.accepted && (
                    <p className="text-green-600 text-sm mt-2">
                      ✅ Declaration already submitted
                    </p>
                  )}
                </div>

                {/* APPROVE ALL */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      if (!lawyerDeclarationAccepted) {
                        setLawyerDeclarationError(true);
                        return toast.error('Accept declaration first');
                      }
                      updateUserDocStatus(selectedUserDocs._id, 'approved');
                    }}
                    disabled={selectedUserDocs.documents.every(
                      (doc) => doc.status !== 'pending',
                    )}
                    className="flex-1 bg-cardGreen text-darkWalnut py-2 rounded hover:bg-richBrown disabled:bg-gray-400"
                  >
                    Approve All
                  </button>

                  <button
                    onClick={() => {
                      if (!lawyerDeclarationAccepted) {
                        setLawyerDeclarationError(true);
                        return toast.error('Accept declaration first');
                      }
                      updateUserDocStatus(selectedUserDocs._id, 'rejected');
                    }}
                    disabled={selectedUserDocs.documents.every(
                      (doc) => doc.status !== 'pending',
                    )}
                    className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
                  >
                    Reject All
                  </button>
                </div>

                {/* CLOSE */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-6 w-full bg-sand500 text-white py-2 rounded hover:bg-richBrown"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <HowItWorks />
      <Testimonials />
      <BackToTop />
    </div>
  );
};

export default LawyerHome;
