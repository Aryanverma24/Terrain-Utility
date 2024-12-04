// // ParentComponent.jsx
// import React, { useState, useEffect } from 'react';
// import Chat from './Chat';

// const ParentComponent = () => {
//   const [landId, setLandId] = useState(null);
//   const [buyerId, setBuyerId] = useState(null);
//   const [ownerId, setOwnerId] = useState(null);

//   useEffect(() => {
//     // Simulate fetching IDs from an API or database
//     setTimeout(() => {
//       // Simulating values being set after fetching
//       setLandId('land123');
//       setBuyerId('buyer456');
//       setOwnerId('owner789');
//     }, 1000);  // Simulate async data fetch with a delay
//   }, []);

//   // Log the values of IDs before rendering the Chat component
//   useEffect(() => {
//     console.log("Parent Component - landId:", landId);
//     console.log("Parent Component - buyerId:", buyerId);
//     console.log("Parent Component - ownerId:", ownerId);
//   }, [landId, buyerId, ownerId]);

//   return (
//     <div>
//       <h1>Parent Component</h1>
//       {landId && buyerId && ownerId ? (
//         <Chat landId={landId} buyerId={buyerId} ownerId={ownerId} />
//       ) : (
//         <p>Loading chat...</p>
//       )}
//     </div>
//   );
// };

// export default ParentComponent;
