"use-strict";
import axios from "axios";
import { ROUTES } from "../config/routes/constants";
export async function uploadCandidateInfo(formData, token) {
  try {
    let s3BadBucketUploadResponse;
    if (formData.cv !== null) {
      const data = {
        fullname: formData.fullname,
        email: formData.email,
        phone_number: formData.phone_number,
      };
      const response = await axios.post(
        `${ROUTES.CANDIDATE_MICROSERVICE_URL}/saveCandidateInfo`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const key = Date.now() + "_" + formData.cv.name;
      const urlResponse = await axios.get(
        `${ROUTES.CANDIDATE_MICROSERVICE_URL}/defaultUploadUrl`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            s3filekey: key,
          },
        },
      );

      const url = urlResponse.data.url;

      let s3uploadResponse = await axios.put(url, formData.cv, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // let s3uploadResponse = 500;

      if (s3uploadResponse.status !== 200) {
        const badBucketUrlResponse = await axios.get(
          `${ROUTES.CANDIDATE_MICROSERVICE_URL}/badbucketUploadURL`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              s3filekey: key,
            },
          },
        );

        const badbucketUploadURL = badBucketUrlResponse.data.url;

        s3BadBucketUploadResponse = await axios.put(
          badbucketUploadURL,
          formData.cv,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
      }

      if (s3uploadResponse.status === 200 && response.status === 200) {
        const bucket = "default";

        await axios.post(
          `${ROUTES.CANDIDATE_MICROSERVICE_URL}/saveCandidateInfo/updateS3FileKey`,
          {},

          {
            headers: {
              Authorization: `Bearer ${token}`,
              s3filekey: key,
              bucket: bucket,
            },
          },
        );

        return {
          status: 200,
          message: "Candidate info uploaded successfully",
        };
      } else if (
        s3BadBucketUploadResponse.status === 200 &&
        response.status === 200
      ) {
        const bucket = "bad";
        await axios.post(
          `${ROUTES.CANDIDATE_MICROSERVICE_URL}/saveCandidateInfo/updateS3FileKey`,
          {},

          {
            headers: {
              Authorization: `Bearer ${token}`,
              s3filekey: key,
              bucket: bucket,
            },
          },
        );
        return {
          status: 500,
          message:
            "CV uplaod has failed. But uploaded to bad bucket, Pleae try again later",
        };
      } else {
        return {
          status: 500,
          message: "Unknown error in saving candidate info or CV upload",
        };
      }
    } else {
      const data = {
        fullname: formData.fullname,
        email: formData.email,
        phone_number: formData.phone_number,
      };
      await axios.post(`http://localhost:4000/saveCandidateInfo`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        status: 200,
        message: "Candidate info uploaded successfully",
      };
    }
  } catch (error) {
    return {
      status: 500,
      message: "Unknown error in saving candidate info or CV upload",
    };
  }
}
