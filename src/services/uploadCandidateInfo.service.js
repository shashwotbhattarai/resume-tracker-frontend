import axios from "axios";
import { ROUTES } from "../config/routes/constants";
export async function uploadCandidateInfo(formData, token) {
  try {
    let s3BadBucketUploadResponse;
    if (formData.cv !== null) {
      const key = Date.now() + "_" + formData.cv.name;
      const urlResponse = await axios.get(
        `${ROUTES.CANDIDATE_MICROSERVICE_URL}/uploadURL`,
        {
          headers: { Authorization: `Bearer ${token}`, key: key },
        },
      );

      const url = urlResponse.data.url;

      const s3uploadResponse = await axios.put(url, formData.cv, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      while (s3uploadResponse.status !== 200) {
        const badBucketUrlResponse = await axios.get(
          `${ROUTES.CANDIDATE_MICROSERVICE_URL}/badbucketUploadURL`,
          {
            headers: { Authorization: `Bearer ${token}`, key: key },
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

        break;
      }
      const data = {
        fullname: formData.fullname,
        email: formData.email,
        phone_number: formData.phone_number,
      };
      const response = await axios.post(`http://localhost:4000/upload`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          newkey: key,
        },
      });
      if (s3uploadResponse.status === 200 && response.status === 200) {
        return {
          status: 200,
          message: "Candidate info uploaded successfully",
        };
      } else if (
        s3BadBucketUploadResponse.status === 200 &&
        response.status === 200
      ) {
        ///TODO : Need to send email to user to inform that CV upload has failed, but has been uploaded to bad bucket.
        return {
          status: 500,
          message:
            "CV uplaod has failed. But uploaded to bad bucket, Pleae try again later",
        };
      } else {
        return {
          status: 500,
        };
      }
    } else {
      const data = {
        fullname: formData.fullname,
        email: formData.email,
        phone_number: formData.phone_number,
      };
      const response = await axios.post(`http://localhost:4000/upload`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          newkey: null,
        },
      });
      if (response.status === 200) {
        return {
          status: 200,
          message: "Candidate info uploaded successfully",
        };
      } else {
        return {
          status: 500,
        };
      }
    }
  } catch (error) {
    return {
      status: 500,
    };
  }
}
