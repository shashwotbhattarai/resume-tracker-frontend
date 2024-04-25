import axios from "axios";
import { ROUTES } from "../config/routes/constants";
export async function downloadCandidateData(selectedCandidate, authToken) {
  try {
    const awsFileKey = selectedCandidate.s3_default_bucket_file_key;

    const downloadResponse = await axios.post(
      `${ROUTES.RECRUITER_MICROSERVICE_URL}/recruiter/download`,
      { key: awsFileKey },
      { headers: { Authorization: `Bearer ${authToken}` } },
    );

    const downloadUrl = downloadResponse.data.url;

    return {
      status: 200,
      message: "Candidate data downloaded successfully",
      data: downloadUrl,
    };
  } catch (error) {
    throw new Error("unknown error in downloadCandidateData service");
  }
}
