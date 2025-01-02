import axios from "axios";
import { uploadCandidateInfo } from "../services/uploadCandidateInfo.service";

jest.mock("axios");

describe("uploadCandidateInfo", () => {
  it("should upload candidate info with CV successfully", async () => {
    const formData = {
      cv: { name: "test_cv.pdf" },
      fullname: "John Doe",
      email: "john@example.com",
      phone_number: "1234567890",
    };
    const token = "test_token";
    const mockUploadURLResponse = { data: { url: "https://mock-s3-url.com" } };
    const mockS3UploadResponse = { status: 200 };
    const mockFinalUploadResponse = { status: 200 };

    // Mocking axios.get and axios.put responses
    axios.get.mockResolvedValue(mockUploadURLResponse);
    axios.put.mockResolvedValue(mockS3UploadResponse);
    axios.post.mockResolvedValue(mockFinalUploadResponse);

    const response = await uploadCandidateInfo(formData, token);

    expect(response).toEqual({
      status: 200,
      message: "Candidate info uploaded successfully",
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${token}` }),
      }),
    );

    expect(axios.put).toHaveBeenCalledWith(
      mockUploadURLResponse.data.url,
      formData.cv,
      expect.anything(),
    );

    expect(axios.post).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        fullname: formData.fullname,
        email: formData.email,
        phone_number: formData.phone_number,
      }),
      expect.anything(),
    );
  });

  // Test case for successful upload without CV
  // it("should upload candidate info successfully without CV", async () => {
  //   const formData = {
  //     cv: null,
  //     fullname: "Jane Doe",
  //     email: "jane@example.com",
  //     phone_number: "0987654321",
  //   };
  //   const token = "test_token";
  //   const mockFinalUploadResponse = { status: 200 };

  //   // Mocking axios.post response
  //   axios.post.mockResolvedValue(mockFinalUploadResponse);

  //   const response = await uploadCandidateInfo(formData, token);

  //   expect(response).toEqual({
  //     status: 200,
  //     message: "Candidate info uploaded successfully",
  //   });

  //   expect(axios.post).toHaveBeenCalledWith(
  //     expect.anything(),
  //     expect.objectContaining({
  //       fullname: formData.fullname,
  //       email: formData.email,
  //       phone_number: formData.phone_number,
  //     }),
  //     expect.anything(),
  //   );
  // });

  // Test case for handling errors
  it("should return status 500 on error", async () => {
    const formData = {
      cv: { name: "test_cv.pdf" },
      fullname: "John Doe",
      email: "john@example.com",
      phone_number: "1234567890",
    };
    const token = "test_token";

    // Simulate an error
    axios.get.mockRejectedValue(new Error("Test Error"));

    const response = await uploadCandidateInfo(formData, token);

    expect(response).toEqual({
      status: 500,
      message: "Unknown error in saving candidate info or CV upload",
    });
  });

  // Test case for S3 upload failure
  it("should return status 500 if S3 upload fails", async () => {
    const formData = {
      cv: { name: "test_cv.pdf" },
      fullname: "John Doe",
      email: "john@example.com",
      phone_number: "1234567890",
    };
    const token = "test_token";
    const mockUploadURLResponse = { data: { url: "https://mock-s3-url.com" } };
    const mockS3UploadFailedResponse = { status: 400 }; // Simulate a failed S3 upload

    // Mocking axios.get and axios.put responses
    axios.get.mockResolvedValue(mockUploadURLResponse);
    axios.put.mockResolvedValue(mockS3UploadFailedResponse);

    const response = await uploadCandidateInfo(formData, token);

    expect(response).toEqual({
      status: 500,
      message: "Unknown error in saving candidate info or CV upload",
    });

    // Ensure the axios.put was called for the S3 upload attempt
    expect(axios.put).toHaveBeenCalledWith(
      mockUploadURLResponse.data.url,
      formData.cv,
      expect.anything(),
    );
  });

  // Test case for final upload failure when CV is not null
  it("should return status 500 if final upload with CV fails", async () => {
    const formData = {
      cv: { name: "test_cv.pdf" },
      fullname: "John Doe",
      email: "john@example.com",
      phone_number: "1234567890",
    };
    const token = "test_token";
    const mockUploadURLResponse = { data: { url: "https://mock-s3-url.com" } };
    const mockS3UploadResponse = { status: 200 };
    const mockFinalUploadFailedResponse = { status: 400 }; // Simulate a failed final upload

    // Mocking axios.get, axios.put, and axios.post responses
    axios.get.mockResolvedValue(mockUploadURLResponse);
    axios.put.mockResolvedValue(mockS3UploadResponse);
    axios.post.mockResolvedValue(mockFinalUploadFailedResponse);

    const response = await uploadCandidateInfo(formData, token);

    expect(response).toEqual({
      status: 500,
      message: "Unknown error in saving candidate info or CV upload",
    });

    // Ensure the axios.post was called for the final upload attempt
    expect(axios.post).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        fullname: formData.fullname,
        email: formData.email,
        phone_number: formData.phone_number,
      }),
      expect.anything(),
    );
  });

  // Test case for final upload failure when CV is null
  it("should return status 500 if final upload without CV fails", async () => {
    const formData = {
      cv: null,
      fullname: "Jane Doe",
      email: "jane@example.com",
      phone_number: "0987654321",
    };
    const token = "test_token";
    const mockFinalUploadFailedResponse = { status: 400 }; // Simulate a failed final upload

    // Mocking axios.post response for final upload failure
    axios.post.mockResolvedValue(mockFinalUploadFailedResponse);

    const response = await uploadCandidateInfo(formData, token);

    expect(response).toEqual({ status: 500 });

    // Ensure the axios.post was called for the final upload attempt
    expect(axios.post).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        fullname: formData.fullname,
        email: formData.email,
        phone_number: formData.phone_number,
      }),
      expect.anything(),
    );
  });

  // You can add more tests here to cover other edge cases
});
