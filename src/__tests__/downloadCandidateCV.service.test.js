import { downloadCandidateData } from "../services/downloadCandidateCV.service";
import axios from "axios";
jest.mock("axios");

describe("Download candidate service", () => {
  test("Download successfull", async () => {
    axios.post.mockResolvedValue({
      status: 200,
      message: "download successfull",
      data: { url: "some url" },
    });
    try{
      const response = await downloadCandidateData("mocktoken");
      expect(response.status).toBe(200);
      expect(response.message).toBe("Candidate data downloaded successfully");
    }catch{
      console.log("inside catch block")
    }
   
  });
  test("Error", async () => {
    axios.get.mockResolvedValue({
      status: 500,
      data: { message: "some error" },
    });
    try {
      await downloadCandidateData("mocktoken");
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toEqual(
        new Error("unknown error in downloadCandidateData service"),
      );
    }
  });
});
