import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadCandidateInfo } from "../services/uploadCandidateInfo.service";
import Spinner from "./loader.component";
import { fetchOneCandidateData } from "../services/fetchCandidateData.service";

const Upload = () => {
  const [formData, setFormData] = useState({
    fullname: null,
    email: null,
    phone_number: null,
    cv: null,
  });
  const accessToken = localStorage.getItem("token");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [url, setUrl] = useState("");
  const [key, setKey] = useState(Date.now());

  const urlRef = useRef("");

  const navigate = useNavigate();

  async function fetchUserData() {
    const res = await fetchOneCandidateData(accessToken);
    if (res.status === 200) {
      setFormData({
        fullname: res.data.candidates.fullname,
        email: res.data.candidates.email,
        phone_number: res.data.candidates.phone_number,
        cv: null,
      });
      setUrl(res.data.url);
      urlRef.current = res.data.url;
    }
  }
  function previewCV() {
    fetchUserData().then(() => {
      if (urlRef.current) {
        window.open(urlRef.current, "_blank");
      }
    });
  }

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {}, [formData.cv]);

  const handleInputChangeForFullName = (e) => {
    setMessage("");
    setFormData({ ...formData, fullname: e.target.value });
  };

  const handleInputChangeForEmail = (e) => {
    setMessage("");
    setFormData({ ...formData, email: e.target.value });
  };

  const handleInputChangeForPhoneNumber = (e) => {
    setMessage("");
    setFormData({ ...formData, phone_number: e.target.value || null });
  };

  const handleInputChangeForCV = (e) => {
    setMessage("");
    setFormData({ ...formData, cv: e.target.files[0] || null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await uploadCandidateInfo(formData, accessToken);
    if (response.status === 200) {
      setFormData({
        fullname: null,
        email: null,
        phone_number: null,
        cv: null,
      });
      setKey(Date.now());
      setLoading(false);
      const successMessage = "User details uploaded successfully";

      setMessage(successMessage);
      setSuccess(true);

      setTimeout(() => setMessage(""), 3000);

      fetchUserData();
    } else {
      setLoading(false);
      const errorMessage = "Something went wrong, Please try again";
      setMessage(errorMessage);
      setSuccess(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="p-4 text-right">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>

      <div className="flex-grow flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="fullname"
              >
                Full Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="fullname"
                type="text"
                name="fullname"
                value={formData.fullname || ""}
                onChange={handleInputChangeForFullName}
                minLength="3"
                pattern="^[A-Za-z]+(?: [A-Za-z]+)*$"
                title="Fullname must contain only letters."
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChangeForEmail}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="phoneNumber"
              >
                Phone Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="phoneNumber"
                type="text"
                name="phoneNumber"
                value={formData.phone_number || ""}
                onChange={handleInputChangeForPhoneNumber}
                minLength="10"
                maxLength="14"
                pattern="\+?[0-9]+$"
                title="Phone number must contain only numbers and must be 10 to 14 digits long."
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="cv"
              >
                CV
              </label>
              <input
                key={key}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="cv"
                type="file"
                accept="application/pdf"
                name="cv"
                onChange={handleInputChangeForCV}
                size={100}
              />
              <div className="flex justify-end">
                {url && (
                  <button
                    type="button"
                    onClick={previewCV}
                    disabled={loading}
                    className={`bg-blue-500 hover:bg-blue-700 text-white mt-1 py-0 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Preview Existing CV
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-start">
              <button
                type="submit"
                disabled={loading}
                className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Submit
              </button>
            </div>

            {loading && <Spinner />}

            {message && (
              <p
                className={`mt-4 px-4 py-2 rounded ${success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
