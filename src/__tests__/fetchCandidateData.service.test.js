import {
  fetchAllCandidateData,
  fetchOneCandidateData,
} from "../services/fetchCandidateData.service";
import axios from "axios";
import * as jwtdecodeModule from "jwt-decode";
jest.mock("axios");

describe("Fetch All candidateinfo service", () => {
  test("Fetch successful", async () => {
    axios.get.mockResolvedValue({ status: 200, message: "fetch successfull" });

    try {
      const response = await fetchAllCandidateData("mocktoken");
      expect(response.status).toBe(200);
      expect(response.message).toBe("Candidate data fetched successfully");
    } catch {
      console.log("inside catch block");
    }
  });
  test("unknown error", async () => {
    axios.get.mockRejectedValue(new Error("some unkown error"));
    try {
      await fetchAllCandidateData("mocktoken");
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toEqual(
        new Error("unknown error in fetchCandidateData service"),
      );
    }
  });
});

describe("Fetch one candidateinfo service", () => {
  test("Fetch successful", async () => {
    const jwtdecodeSpy = jest.spyOn(jwtdecodeModule, "jwtDecode");
    jwtdecodeSpy.mockResolvedValue({
      role: "candidate",
      user_id: "bsdfbsbfd6565",
    });
    axios.get.mockResolvedValue({
      status: 200,
      message: "fetch successfull",
      data: { candidates: { user_id: "bsdfbsbfd6565" }, url: "url" },
    });
    const response = await fetchOneCandidateData("mocktoken");
    expect(response.status).toBe(200);
    expect(response.message).toBe("Candidate data fetched successfully");
    expect(response.data.url).toBe("url");
  });
  test("unknown error", async () => {
    const jwtdecodeSpy = jest.spyOn(jwtdecodeModule, "jwtDecode");
    jwtdecodeSpy.mockResolvedValue({
      role: "candidate",
      user_id: "bsdfbsbfd6565",
    });
    axios.get.mockRejectedValue(new Error("some unkown error"));
    try {
      await fetchOneCandidateData("mocktoken");
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toEqual(
        new Error("unknown error in fetchCandidateData service"),
      );
    }
  });
});
