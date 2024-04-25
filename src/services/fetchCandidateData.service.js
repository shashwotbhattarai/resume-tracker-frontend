import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ROUTES } from "../config/routes/constants";
export async function fetchAllCandidateData(authToken) {
  try {
    const response = await axios.get(
      `${ROUTES.RECRUITER_MICROSERVICE_URL}/recruiter/getCandidateInfo/all`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    const candidates = response.data;
    return {
      status: 200,
      message: "Candidate data fetched successfully",
      data: candidates,
    };
  } catch (error) {
    throw new Error("unknown error in fetchCandidateData service");
  }
}

export async function fetchOneCandidateData(authToken) {
  try {
    const decoded = jwtDecode(authToken);
    const user_id = decoded.user_id;
    const response = await axios.get(
      `${ROUTES.CANDIDATE_MICROSERVICE_URL}/getCandidateInfo/${user_id}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    );
    const candidates = response.data.data;
    const url = response.data.url;
    return {
      status: 200,
      message: "Candidate data fetched successfully",
      data: { candidates: candidates, url: url },
    };
  } catch (error) {
    return {
      status: 500,
    };
  }
}
