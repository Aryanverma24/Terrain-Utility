import React, { useState } from 'react';
import { API } from '../../utils/API';

const CreateLand = () => {
  const [landtype, setLandtype] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('landtype', landtype);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('pincode', pincode);
    formData.append('image', image);

    try {
      const response = await API.post('/uploads', {
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col ml-[30rem] p-[4rem]'>
      <input
        type="text"
        value={landtype}
        onChange={(e) => setLandtype(e.target.value)}
        placeholder="Land Type"
      />
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City"
      />
      <input
        type="text"
        value={state}
        onChange={(e) => setState(e.target.value)}
        placeholder="State"
      />
      <input
        type="text"
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
        placeholder="Pincode"
      />
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        placeholder="Image"
      />
      <button type="submit">Submit</button>
    </form>
  );
};


export default CreateLand;